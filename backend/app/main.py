from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.pedidos.router import router as pedidos_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="API REST para el Trabajo Práctico Integrador Food Store - Programación 4",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_V1_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_V1_PREFIX)
app.include_router(usuarios_router, prefix=API_V1_PREFIX)
app.include_router(categorias_router, prefix=API_V1_PREFIX)
app.include_router(productos_router, prefix=API_V1_PREFIX)
app.include_router(pedidos_router, prefix=API_V1_PREFIX)

@app.get(API_V1_PREFIX + "/health", tags=["Health"])
def health_check():
    return {"status": "ok"}