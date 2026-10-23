from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

import httpx


app = FastAPI(
    title="Student Management API Gateway",
    description="Single entry point for Auth, Student, and Course microservices",
    version="1.0.0",
)


# CORS configuration for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Microservice URLs
AUTH_SERVICE_URL = "http://127.0.0.1:8001"
STUDENT_SERVICE_URL = "http://127.0.0.1:8002"
COURSE_SERVICE_URL = "http://127.0.0.1:8003"


# Headers that should not be forwarded between services
HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "content-length",
    "host",
}


@app.get("/")
async def home():
    return {
        "message": "Student Management API Gateway is running"
    }


@app.get("/health")
async def health():
    services = {
        "auth": AUTH_SERVICE_URL,
        "student": STUDENT_SERVICE_URL,
        "course": COURSE_SERVICE_URL,
    }

    results = {}

    async with httpx.AsyncClient(timeout=3.0) as client:
        for name, base_url in services.items():
            try:
                response = await client.get(
                    f"{base_url}/health"
                )

                results[name] = (
                    "healthy"
                    if response.is_success
                    else "unhealthy"
                )

            except httpx.RequestError:
                results[name] = "unavailable"

    overall = (
        "healthy"
        if all(
            status == "healthy"
            for status in results.values()
        )
        else "degraded"
    )

    return {
        "status": overall,
        "services": results,
    }


async def forward_request(
    request: Request,
    base_url: str,
    path: str,
):
    target_url = f"{base_url}{path}"

    # Forward request headers except hop-by-hop headers
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in HOP_BY_HOP_HEADERS
    }

    try:
        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:
            upstream = await client.request(
                method=request.method,
                url=target_url,
                params=request.query_params,
                content=await request.body(),
                headers=headers,
            )

        # Forward the response headers
        response_headers = {
            key: value
            for key, value in upstream.headers.items()
            if key.lower() not in HOP_BY_HOP_HEADERS
        }

        # Return the actual response body and status from the service
        return Response(
            content=upstream.content,
            status_code=upstream.status_code,
            headers=response_headers,
        )

    except httpx.RequestError as exc:
        return JSONResponse(
            status_code=502,
            content={
                "detail": (
                    "The requested microservice is unavailable."
                ),
                "error": str(exc),
            },
        )


# Authentication service routes
@app.api_route(
    "/auth",
    methods=[
        "GET", "POST", "PUT", "PATCH",
        "DELETE", "OPTIONS",
    ],
)
@app.api_route(
    "/auth/{path:path}",
    methods=[
        "GET", "POST", "PUT", "PATCH",
        "DELETE", "OPTIONS",
    ],
)
async def auth_proxy(
    request: Request,
    path: str = "",
):
    target_path = (
        "/auth"
        if not path
        else f"/auth/{path}"
    )

    return await forward_request(
        request,
        AUTH_SERVICE_URL,
        target_path,
    )


# Student service routes
@app.api_route(
    "/students",
    methods=["GET", "POST", "OPTIONS"],
)
@app.api_route(
    "/students/{path:path}",
    methods=[
        "GET", "PUT", "PATCH",
        "DELETE", "OPTIONS",
    ],
)
async def student_proxy(
    request: Request,
    path: str = "",
):
    target_path = (
        "/students"
        if not path
        else f"/students/{path}"
    )

    return await forward_request(
        request,
        STUDENT_SERVICE_URL,
        target_path,
    )


# Course service routes
@app.api_route(
    "/courses",
    methods=["GET", "POST", "OPTIONS"],
)
@app.api_route(
    "/courses/{path:path}",
    methods=[
        "GET", "PUT", "PATCH",
        "DELETE", "OPTIONS",
    ],
)
async def course_proxy(
    request: Request,
    path: str = "",
):
    target_path = (
        "/courses"
        if not path
        else f"/courses/{path}"
    )

    return await forward_request(
        request,
        COURSE_SERVICE_URL,
        target_path,
    )