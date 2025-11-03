// src/components/pages/Blogs.jsx
import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Blogs = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Lanzamos Nueva Línea Vegana",
      description: "Descubre nuestros deliciosos pasteles 100% veganos, hechos con ingredientes naturales y sin sacrificar el sabor.",
      image: "https://placehold.co/600x400/FFC0CB/884513?text=Pasteles+Veganos",
      category: "Novedad",
      categoryClass: "bg-novedad",
      date: "15 Diciembre 2024"
    },
    {
      id: 2,
      title: "Taller de Decoración Navideña",
      description: "Aprende a decorar tus propios pasteles navideños en nuestro taller gratuito este sábado.",
      image: "https://placehold.co/600x400/FFF5E1/884513?text=Taller+Navideño",
      category: "Evento",
      categoryClass: "bg-evento",
      date: "10 Diciembre 2024"
    },
    {
      id: 3,
      title: "Ganadores del Premio a Mejor Pastelería 2024",
      description: "Estamos orgullosos de anunciar que hemos sido reconocidos como la mejor pastelería de la región.",
      image: "https://placehold.co/600x400/884513/FFF5E1?text=Premio+2024",
      category: "Logro",
      categoryClass: "bg-promocion",
      date: "5 Diciembre 2024"
    },
    {
      id: 4,
      title: "Sabores de Verano 2024",
      description: "Prueba nuestros nuevos sabores refrescantes: limón merengue, frutos rojos y coco tropical.",
      image: "https://placehold.co/600x400/FFC0CB/884513?text=Sabores+Verano",
      category: "Temporada",
      categoryClass: "bg-novedad",
      date: "1 Diciembre 2024"
    },
    {
      id: 5,
      title: "2x1 en Cupcakes Todos los Miércoles",
      description: "Aprovecha nuestra promoción especial: lleva 2 cupcakes por el precio de 1 todos los miércoles.",
      image: "https://placehold.co/600x400/FFF5E1/884513?text=Promo+2x1",
      category: "Promoción",
      categoryClass: "bg-promocion",
      date: "28 Noviembre 2024"
    },
    {
      id: 6,
      title: "Ahora Usamos Solo Ingredientes Orgánicos",
      description: "Mejoramos nuestra calidad: todos nuestros productos ahora son elaborados con ingredientes 100% orgánicos.",
      image: "https://placehold.co/600x400/884513/FFF5E1?text=Ingredientes+Orgánicos",
      category: "Calidad",
      categoryClass: "bg-evento",
      date: "25 Noviembre 2024"
    }
  ];

  return (
    <Container className="my-5">
      {/* Header del Blog */}
      <div className="text-center mb-5">
        <h1 style={{ fontFamily: 'Pacifico, cursive' }}>Blog y Noticias</h1>
        <p className="lead">
          Mantente al día con las últimas novedades, tips y tendencias en el mundo de la repostería
        </p>
      </div>

      {/* Grid de Artículos del Blog */}
      <Row className="g-4">
        {blogPosts.map((post) => (
          <Col key={post.id} md={6} lg={4}>
            <Card className="h-100 shadow-sm blog-card">
              <Card.Img 
                variant="top" 
                src={post.image} 
                alt={post.title}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body className="d-flex flex-column">
                <div className="mb-2">
                  <Badge className={`blog-badge ${post.categoryClass}`}>
                    {post.category}
                  </Badge>
                </div>
                <Card.Title className="h5">{post.title}</Card.Title>
                <Card.Text className="flex-grow-1">
                  {post.description}
                </Card.Text>
                <div className="mt-auto">
                  <Button variant="outline-primary" size="sm" className="w-100">
                    Leer más
                  </Button>
                </div>
              </Card.Body>
              <Card.Footer className="bg-transparent">
                <small className="text-muted">
                  <i className="bi bi-calendar me-1"></i>
                  {post.date}
                </small>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Sección de Suscripción - AGREGADA la clase blog-subscription */}
      <Row className="mt-5">
        <Col>
          <div className="text-center p-4 border rounded blog-subscription">
            <h2 style={{ fontFamily: 'Pacifico, cursive' }}>¡No te pierdas ninguna novedad!</h2>
            <p className="mb-3">
              Suscríbete a nuestro blog y recibe recetas, tips de repostería y promociones exclusivas
            </p>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <input 
                type="email" 
                className="form-control" 
                placeholder="Tu correo electrónico"
                style={{ maxWidth: '300px' }}
              />
              <Button variant="primary">
                Suscribirse
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Blogs;