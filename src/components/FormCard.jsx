import { Card, Button, Form } from 'react-bootstrap';

export default function FormCard({
  role,
  email,
  password,
  MMCNumber,
  setEmail,
  setPassword,
  setMMCNumber,
  handleGoogleLogin,
  handleSubmit,
  userExists,
  handleLogin,
}) {
  return (
    <Card style={{ maxWidth: '100%', margin: '0 auto' }} className="shadow-lg border-0">
      <Card.Body>
        <h3 className="mb-4 text-center">
          {userExists ? 'Log In' : 'Sign Up'} as {role.charAt(0).toUpperCase() + role.slice(1)}
        </h3>

        {/* Google Login Button */}
        <Button
          variant="outline-danger"
          className="w-100 mb-3"
          onClick={handleGoogleLogin}
        >
          <i className="bi bi-google me-2"></i> Continue with Google
        </Button>

        <p className="text-center text-muted">or</p>

        {/* Normal Login Form */}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="email" className="mb-3">
            <Form.Control
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="password" className="mb-3">
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          {role === 'doctor' && (
            <Form.Group controlId="MMCNumber" className="mb-3">
              <Form.Control
                type="text"
                placeholder="MMC Number"
                value={MMCNumber}
                onChange={(e) => setMMCNumber(e.target.value)}
                required
              />
            </Form.Group>
          )}

          <Button type="submit" variant="primary" className="w-100">
            {userExists ? 'Log In' : 'Sign Up'}
          </Button>
        </Form>

        <p className="mt-4 text-center text-muted">
          By signing up, you agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </p>

        <p className="mt-4 fw-bold text-center">
          Already have an account?
        </p>
        <div className="d-grid">
          <Button
            className="rounded-pill"
            variant="outline-primary"
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </div> {/* Closing the d-grid div */}
      </Card.Body>
    </Card>
  );
}
