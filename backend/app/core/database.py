from collections.abc import Callable
from sqlmodel import Session, SQLModel, create_engine
from app.core.config import settings

connect_args = (
    {"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
)


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    # Importación diferida de los modelos para registrarlos en SQLModel.metadata
    from app.modules.usuarios.models import Usuario
    from app.modules.categorias.models import Categoria
    from app.modules.productos.models import Producto
    from app.modules.pedidos.models import Pedido, DetallePedido

    SQLModel.metadata.create_all(engine)


def get_session():
    with session_factory() as session:
        yield session