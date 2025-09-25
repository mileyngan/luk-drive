import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Alert, Tab, Tabs } from 'react-bootstrap';
import { Plus, Pencil, Trash, Play, Book } from 'react-bootstrap-icons';
import api from '../services/api';

const Chapters = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('novice');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    program_type: 'novice',
    chapter_number: 1,
    video_url: '',
    ebook_content: ''
  });

  const fetchChapters = async () => {
    try {
      const response = await api.get(`/chapters?program_type=${activeTab}`);
      setChapters(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load chapters');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [activeTab, fetchChapters]); // Added fetchChapters as dependency

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/chapters', formData);
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        program_type: activeTab,
        chapter_number: 1,
        video_url: '',
        ebook_content: ''
      });
      fetchChapters();
    } catch (err) {
      setError('Failed to create chapter');
    }
  };

  const filteredChapters = chapters.filter(chapter => chapter.program_type === activeTab);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Chapters Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="me-2" /> Add Chapter
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="novice" title="Novice Program">
          <ChapterTable chapters={filteredChapters} />
        </Tab>
        <Tab eventKey="recyclage" title="Recyclage Program">
          <ChapterTable chapters={filteredChapters} />
        </Tab>
      </Tabs>

      {/* Add Chapter Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Chapter</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Program Type</Form.Label>
              <Form.Select
                name="program_type"
                value={formData.program_type}
                onChange={handleInputChange}
                required
              >
                <option value="novice">Novice</option>
                <option value="recyclage">Recyclage</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Chapter Number</Form.Label>
              <Form.Control
                type="number"
                name="chapter_number"
                value={formData.chapter_number}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Video URL (YouTube)</Form.Label>
              <Form.Control
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ebook Content</Form.Label>
              <Form.Control
                as="textarea"
                name="ebook_content"
                value={formData.ebook_content}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter ebook content here..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Chapter
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

const ChapterTable = ({ chapters }) => (
  <Card>
    <Card.Body>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Chapter #</th>
            <th>Title</th>
            <th>Description</th>
            <th>Video</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter) => (
            <tr key={chapter.id}>
              <td>{chapter.chapter_number}</td>
              <td>{chapter.title}</td>
              <td>{chapter.description?.substring(0, 50)}...</td>
              <td>
                {chapter.video_url ? (
                  <Play className="text-primary" />
                ) : (
                  <Book className="text-muted" />
                )}
              </td>
              <td>
                <span className={`badge ${chapter.is_published ? 'bg-success' : 'bg-warning'}`}>
                  {chapter.is_published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td>
                <Button variant="outline-primary" size="sm" className="me-2">
                  <Pencil />
                </Button>
                <Button variant="outline-danger" size="sm">
                  <Trash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);

export default Chapters;