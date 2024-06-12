import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import Validation from './SignUpValidation';
import axios from 'axios';
import bcrypt from 'bcryptjs';
function SignUp() {
  const [values, setValues] = useState({
    username: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const [error, setError] = useState({});

  const handleInput = (event) => {
    setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(Validation(values));
	const hashedPassword = await bcrypt.hash(values.password, 10);

    axios.post('http://localhost:8081/signup', { ...values, password: hashedPassword }) 
      .then(res => {
        console.log("Response from backend:", res);
        navigate('/signin');
      })
      .catch(err => console.log(err));
  }
  
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">Register</h2>
        <form action='' onSubmit={handleSubmit}>
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                placeholder="Enter Username"
                autoComplete="off"
                name="username"
                className="form-control"
                onChange={handleInput}
                value={values.username}
              />
            </div>
            {error.username && <span className='text-danger'>{error.username}</span>}
          </div>
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                placeholder="Enter Email"
                autoComplete="off"
                name="email"
                className="form-control"
                onChange={handleInput}
                value={values.email}
              />
            </div>
            {error.email && <span className='text-danger'>{error.email}</span>}
          </div>
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                placeholder="Enter Password"
                name="password"
                className="form-control"
                onChange={handleInput}
                value={values.password}
              />
            </div>
            {error.password && <span className='text-danger'>{error.password}</span>}
          </div>
          <button type="submit" className="btn btn-dark w-100">
            Register
          </button>
        </form>
        <p className="mt-3 mb-0 text-center">Already Have an Account?</p>
     <Link
          to="/signin"
          className="btn btn-link btn-sm d-block mx-auto text-center"
        >
          Login
        </Link>
      </div>
    </div>
  )
}

export default SignUp;