import { io } from 'socket.io-client';

const port = process.env.PORT || 3000;

export const socket = io(`http://localhost:${port}`);