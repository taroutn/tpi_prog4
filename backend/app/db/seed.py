from sqlmodel import select
from app.core.database import create_all_tables, session_factory
from app.core.security import get_password_hash
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.models import Pedido, DetallePedido


CATEGORIAS_SEED = [
    {
        "nombre": "Hamburguesas",
        "descripcion": "Hamburguesas caseras a la parrilla con pan de papa artesanal.",
    },
    {
        "nombre": "Pizzas",
        "descripcion": "Pizzas a la piedra con masa madre de fermentación lenta.",
    },
    {
        "nombre": "Empanadas y Entradas",
        "descripcion": "Empanadas regionales, papas rústicas y entradas para compartir.",
    },
    {
        "nombre": "Bebidas y Postres",
        "descripcion": "Bebidas frías, aguas saborizadas y postres caseros.",
    },
]

PRODUCTOS_SEED = [
    {
        "categoria": "Hamburguesas",
        "nombre": "Doble Smash Cheddar & Bacon",
        "descripcion": "Doble medallón smash de 110g, cuádruple cheddar, panceta crocante y salsa especial.",
        "precio_base": 11500.0,
        "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "stock": 25,
    },
    {
        "categoria": "Hamburguesas",
        "nombre": "Burger Criolla Provoleta",
        "descripcion": "Medallón de 180g, provoleta grillada, morrones asados, cebolla caramelizada y criolla.",
        "precio_base": 12200.0,
        "imagen_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
        "stock": 20,
    },
    {
        "categoria": "Hamburguesas",
        "nombre": "Crispy Chicken Burger",
        "descripcion": "Pechuga de pollo rebozada crocante, lechuga capuchina, tomate, pepinillos y mayo de hierbas.",
        "precio_base": 10400.0,
        "imagen_url": "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80",
        "stock": 18,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Muzzarella Clásica",
        "descripcion": "Salsa de tomates frescos cocinados lentamente, abundante muzzarella, orégano y aceitunas verdes.",
        "precio_base": 13500.0,
        "imagen_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "stock": 15,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Napolitana con Ajo",
        "descripcion": "Muzzarella, rodajas de tomate fresco, albahaca, toque de ajo confitado y aceite de oliva.",
        "precio_base": 14800.0,
        "imagen_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "stock": 15,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Fugazzeta Rellena",
        "descripcion": "Doble masa rellena de muzzarella y jamón, cubierta con cebolla blanca y morada gratinada.",
        "precio_base": 16900.0,
        "imagen_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
        "stock": 10,
    },
    {
        "categoria": "Empanadas y Entradas",
        "nombre": "Media Docena de Empanadas Cortadas a Cuchillo",
        "descripcion": "6 empanadas de carne suave cortada a cuchillo, horneadas al barro.",
        "precio_base": 9600.0,
        "imagen_url": "https://images.unsplash.com/photo-1624128082323-beb6b8b508db?auto=format&fit=crop&w=800&q=80",
        "stock": 30,
    },
    {
        "categoria": "Empanadas y Entradas",
        "nombre": "Papas Rústicas con Cheddar y Verdeo",
        "descripcion": "Porción abundante de papas triple cocción con salsa cheddar fundida, panceta y cebolla de verdeo.",
        "precio_base": 7800.0,
        "imagen_url": "https://images.unsplash.com/photo-1633959639810-16c90bee95f9?auto=format&fit=crop&w=800&q=80",
        "stock": 35,
    },
    {
        "categoria": "Bebidas y Postres",
        "nombre": "Gaseosa Retornable Línea Cola 350cc",
        "descripcion": "Botella de Vidrio de 350 mililitros bien fría.",
        "precio_base": 4200.0,
        "imagen_url": "https://images.unsplash.com/photo-1648569883125-d01072540b4c?auto=format&fit=crop&w=800&q=80",
        "stock": 50,
    },
    {
        "categoria": "Bebidas y Postres",
        "nombre": "Chocotorta Artesanal en Frasco",
        "descripcion": "Capas de chocolinas húmedas en café con dulce de leche repostero y queso crema.",
        "precio_base": 5500.0,
        "imagen_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
        "stock": 20,
    },
]


def run_seed() -> None:
    create_all_tables()

    with session_factory() as session:
        # 1. Usuario Admin
        admin = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()
        if not admin:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=get_password_hash("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            print("[SEED] Usuario 'admin' creado.")
        else:
            print("[SEED] Usuario 'admin' ya existe (omitido).")

        cliente = session.exec(select(Usuario).where(Usuario.username == "cliente1")).first()
        if not cliente:
            cliente = Usuario(
                username="cliente1",
                full_name="Cliente Frecuente",
                email="cliente1@foodstore.com",
                hashed_password=get_password_hash("Cliente1234!"),
                role="user",
            )
            session.add(cliente)
            print("[SEED] Usuario 'cliente1' creado.")
        
        session.flush()

        # 2. Categorías
        mapa_categorias: dict[str, int] = {}
        for cat_data in CATEGORIAS_SEED:
            categoria = session.exec(
                select(Categoria).where(Categoria.nombre == cat_data["nombre"])
            ).first()
            if not categoria:
                categoria = Categoria(
                    nombre=cat_data["nombre"],
                    descripcion=cat_data["descripcion"],
                    activo=True,
                )
                session.add(categoria)
                session.flush()
                session.refresh(categoria)
                print(f"[SEED] Categoría '{categoria.nombre}' creada.")
            assert categoria.id is not None
            mapa_categorias[categoria.nombre] = categoria.id

        # 3. Productos
        productos_creados = []
        for prod_data in PRODUCTOS_SEED:
            producto = session.exec(
                select(Producto).where(Producto.nombre == prod_data["nombre"])
            ).first()
            if not producto:
                producto = Producto(
                    categoria_id=mapa_categorias[str(prod_data["categoria"])],
                    nombre=str(prod_data["nombre"]),
                    descripcion=str(prod_data["descripcion"]),
                    precio_base=float(prod_data["precio_base"]),
                    imagen_url=str(prod_data["imagen_url"]),
                    stock=int(prod_data["stock"]),
                    disponible=True,
                    activo=True,
                )
                session.add(producto)
                print(f"[SEED] Producto '{producto.nombre}' creado.")
                
            productos_creados.append(producto)

        session.flush()

        # 4. Pedidos de Prueba
        pedidos_existentes = session.exec(select(Pedido)).first()
        if not pedidos_existentes and cliente and cliente.id:
            # Pedido 1: Pendiente
            p1 = Pedido(
                usuario_id=cliente.id, estado="PENDIENTE", forma_pago="EFECTIVO", 
                direccion_entrega="Av. Libertad 450", notas="Pagaré con $20000", total=0
            )
            session.add(p1)
            session.flush()
            
            det1 = DetallePedido(
                pedido_id=p1.id, producto_id=productos_creados[0].id, cantidad=2,
                nombre_producto=productos_creados[0].nombre, precio_unitario=productos_creados[0].precio_base,
                subtotal=productos_creados[0].precio_base * 2
            )
            session.add(det1)
            p1.total = det1.subtotal
            productos_creados[0].stock -= 2

            # Pedido 2: En Preparación
            p2 = Pedido(
                usuario_id=cliente.id, estado="EN_PREPARACION", forma_pago="TRANSFERENCIA", 
                direccion_entrega="Calle Falsa 123", total=0
            )
            session.add(p2)
            session.flush()

            det2 = DetallePedido(
                pedido_id=p2.id, producto_id=productos_creados[2].id, cantidad=1,
                nombre_producto=productos_creados[2].nombre, precio_unitario=productos_creados[2].precio_base,
                subtotal=productos_creados[2].precio_base * 1
            )
            session.add(det2)
            p2.total = det2.subtotal
            productos_creados[2].stock -= 1

            # Pedido 3: Entregado
            p3 = Pedido(
                usuario_id=cliente.id, estado="ENTREGADO", forma_pago="EFECTIVO", 
                direccion_entrega="Av. Libertad 450", total=0
            )
            session.add(p3)
            session.flush()

            det3 = DetallePedido(
                pedido_id=p3.id, producto_id=productos_creados[5].id, cantidad=3,
                nombre_producto=productos_creados[5].nombre, precio_unitario=productos_creados[5].precio_base,
                subtotal=productos_creados[5].precio_base * 3
            )
            session.add(det3)
            p3.total = det3.subtotal
            productos_creados[5].stock -= 3

            print("[SEED] Pedidos de prueba generados.")

        session.commit()
        print("[SEED] Proceso finalizado correctamente.")


if __name__ == "__main__":
    run_seed()