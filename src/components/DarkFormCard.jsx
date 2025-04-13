import { Card, Button, Form } from 'react-bootstrap';

export default function DarkFormCard({
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
  handleLogin
}) {
  return (
    <Card className="bg-dark text-light shadow-sm" style={{ maxWidth: '100%', margin: '0 auto' }}>
        <Card.Body>
        <h3 className="mb-4 text-center">
            Sign up as {role.charAt(0).toUpperCase() + role.slice(1)}
        </h3>
    
        <Button
            variant="primary"
            className="w-100 mb-3 text-white"
            onClick={handleGoogleLogin}
        >
            Continue with Google
        </Button>
    
        <p className="text-center text-muted">or</p>
    
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="email" className="mb-3">
            <Form.Control
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-dark border-0 shadow-sm"
            />
            </Form.Group>
    
            <Form.Group controlId="password" className="mb-3">
            <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white text-dark border-0 shadow-sm"
            />
            </Form.Group>
    
            {role === 'doctor' && (
            <Form.Group controlId="MMCNumber" className="mb-3">
                <Form.Control
                type="text"
                placeholder="MMC Number"
                value={MMCNumber}
                onChange={(e) => setMMCNumber(e.target.value)}
                className="bg-white text-dark border-0 shadow-sm"
                />
            </Form.Group>
            )}
    
            <Button type="submit" variant="primary" className="w-100">
            {userExists ? 'Log In' : 'Sign Up'}
            </Button>
        </Form>
    
        <p className="mt-4 text-center text-muted">
            By signing up, you agree to the Terms of Service and Privacy Policy.
        </p>
    
        <p className="mt-4 fw-bold text-light text-center">
            Already have an account?
        </p>
        <div className="d-grid">
            <Button
            className="rounded-pill"
            variant="primary"
            onClick={handleLogin}
            >
            Sign In
            </Button>
        </div>
        </Card.Body>
    </Card>  
  );
}
