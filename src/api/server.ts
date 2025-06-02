import express from 'express';
import cors from 'cors';
import { userRouter } from './routes/users.js';
import { dressRouter } from './routes/dresses.js';
import { rentalRouter } from './routes/rentals.js';
import { authRouter } from './routes/auth.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/dresses', dressRouter);
app.use('/api/rentals', rentalRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});