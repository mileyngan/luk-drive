import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpenIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';

const ProgramSelection = () => {
  const { user } = useAuth();

  const programs = [
    {
      id: 'novice',
      title: 'Programme Novice',
      description: 'Formation complète pour les nouveaux conducteurs. Apprenez les bases du code de la route camerounais.',
      icon: BookOpenIcon,
      color: 'primary',
      features: [
        'Code de la route complet',
        'Signalisation routière',
        'Règles de priorité',
        'Conduite défensive',
        'Quiz interactifs'
      ]
    },
    {
      id: 'recyclage',
      title: 'Programme Recyclage',
      description: 'Remise à niveau pour les conducteurs expérimentés. Actualisez vos connaissances.',
      icon: AcademicCapIcon,
      color: 'success',
      features: [
        'Nouvelles réglementations',
        'Conduite écologique',
        'Nouveaux panneaux',
        'Mise à jour des règles',
        'Évaluation rapide'
      ]
    }
  ];

  // If user has a specific program type, redirect directly
  if (user?.programType) {
    const selectedProgram = programs.find(p => p.id === user.programType);
    
    return (
      <div className="min-vh-100 bg-light">
        <Container className="py-5">
          <div className="text-center mb-4">
            <h1 className="h2 text-dark">
              Votre Programme: {user.programType === 'novice' ? 'Novice' : 'Recyclage'}
            </h1>
            <p className="text-muted">
              Vous êtes inscrit(e) au programme {user.programType === 'novice' ? 'Novice' : 'Recyclage'}.
            </p>
          </div>
          
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                {user.programType === 'novice' ? (
                  <BookOpenIcon className="mx-auto h-16 w-16 text-primary" />
                ) : (
                  <AcademicCapIcon className="mx-auto h-16 w-16 text-success" />
                )}
              </div>
              
              <Card.Title className="mb-3">
                Programme {user.programType === 'novice' ? 'Novice' : 'Recyclage'}
              </Card.Title>
              
              <Card.Text className="text-muted mb-4">
                {user.programType === 'novice' 
                  ? 'Formation complète pour les nouveaux conducteurs'
                  : 'Remise à niveau pour les conducteurs expérimentés'
                }
              </Card.Text>
              
              <Button
                as={Link}
                to={`/student/chapters/${user.programType}`}
                variant={user.programType === 'novice' ? 'primary' : 'success'}
              >
                Commencer l'Apprentissage
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="h1 text-dark">
            Choisissez Votre Programme
          </h1>
          <p className="h5 text-muted mt-3">
            Sélectionnez le programme d'apprentissage qui correspond à votre niveau
          </p>
        </div>

        <Row className="g-4">
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <Col key={program.id} lg={6}>
                <Card className="shadow-sm h-100">
                  <div className={`bg-${program.color} text-white text-center p-4`}>
                    <Icon className="mx-auto h-16 w-16 mb-3" />
                    <Card.Title className="mb-0">
                      {program.title}
                    </Card.Title>
                  </div>
                  
                  <Card.Body>
                    <Card.Text className="text-muted mb-4">
                      {program.description}
                    </Card.Text>
                    
                    <div className="mb-4">
                      <h4 className="h6 text-dark mb-3">
                        Ce que vous apprendrez:
                      </h4>
                      <ul className="list-unstyled mb-0">
                        {program.features.map((feature, index) => (
                          <li key={index} className="d-flex align-items-center text-muted mb-2">
                            <span className="text-success me-2">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button
                      as={Link}
                      to={`/student/chapters/${program.id}`}
                      variant={program.color}
                      className="w-100"
                    >
                      Commencer ce Programme
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        <Alert variant="warning" className="mt-4">
          <div className="d-flex">
            <div className="flex-shrink-0 me-3">
              <span className="fs-4">⚠️</span>
            </div>
            <div>
              <h4 className="alert-heading">Information Importante</h4>
              <p className="mb-0">
                Une fois que vous commencez un programme, vous ne pourrez plus changer. 
                Assurez-vous de choisir le programme qui correspond à votre niveau.
              </p>
            </div>
          </div>
        </Alert>
      </Container>
    </div>
  );
};

export default ProgramSelection;