const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3001; // Change this to your desired port number
const cors = require('cors')
const jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json())

mongoose.connect('mongodb+srv://aninda:aninda@cluster0.nka6ouy.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

  const mahasiswaSchema = new mongoose.Schema({
    nama: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    prodi: {
      type: String,
      required: true
    },
    jenisKelamin: {
      type: String,
      required: true
    }
  });
  
  const Mahasiswa = mongoose.model('Mahasiswa', mahasiswaSchema);

  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    }
  });
  
  const User = mongoose.model('User', userSchema);

  // Create a new Mahasiswa
const createMahasiswa = async (req, res) => {
    try {
      const mahasiswa = await Mahasiswa.create(req.body);
      res.status(201).json(mahasiswa);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // Get all Mahasiswa
  const getAllMahasiswa = async (req, res) => {
    try {
      const mahasiswa = await Mahasiswa.find();
      res.json(mahasiswa);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Get a single Mahasiswa by ID
  const getMahasiswaById = async (req, res) => {
    try {
      const mahasiswa = await Mahasiswa.findById(req.params.id);
      if (mahasiswa) {
        res.json(mahasiswa);
      } else {
        res.status(404).json({ message: 'Mahasiswa not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Update a Mahasiswa by ID
  const updateMahasiswa = async (req, res) => {
    try {
      const mahasiswa = await Mahasiswa.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
      if (mahasiswa) {
        res.json(mahasiswa);
      } else {
        res.status(404).json({ message: 'Mahasiswa not found' });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // Delete a Mahasiswa by ID
  const deleteMahasiswa = async (req, res) => {
    try {
      const mahasiswa = await Mahasiswa.findByIdAndDelete(req.params.id);
      if (mahasiswa) {
        res.json({ message: 'Mahasiswa deleted successfully' });
      } else {
        res.status(404).json({ message: 'Mahasiswa not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // User registration
const registerUser = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if the username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
  
      // Create a new user
      const user = await User.create({
        username,
        password
      });
  
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // User login
  const loginUser = async (req, res) => {
      try {
        const { username, password } = req.body;
    
        // Check if the user exists
        const user = await User.findOne({ username });
        if (!user) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }
    
        // Check if the password is correct
        if (password !== user.password) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }
    
        // Generate JWT token
        const token = jwt.sign({ user: user.username }, 'aninda', { expiresIn: '1h' });
  
        // Set the JWT token as a cookie
        res.cookie('token', token, { maxAge: 3600000, httpOnly: true }); // Expiry set to 1 hour (3600000 milliseconds)
    
        res.json({ message: 'Login successful', token });
      } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
      }}
  
      const isAuthenticated = (req, res, next) => {
        try {
          const token = req.headers.authorization.split(' ')[1]; // Extract token from the Authorization header
          const decoded = jwt.verify(token, 'aninda'); // Verify the token using the secret key
      
          // Attach the decoded token to the request object
          req.user = decoded.user;
      
          next(); // Move to the next middleware
        } catch (error) {
          console.error(error);
          return res.status(401).json({ error: 'Invalid token' });
        }
      };

    app.post('/mahasiswa', isAuthenticated,createMahasiswa);
    app.get('/mahasiswa', isAuthenticated, getAllMahasiswa);
    app.get('/mahasiswa/:id', getMahasiswaById);
    app.put('/mahasiswa/:id', updateMahasiswa);
    app.delete('/mahasiswa/:id', isAuthenticated, deleteMahasiswa);
    app.post('/register', registerUser);
    app.post('/login', loginUser);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
