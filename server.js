// server.js

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import rute-rute
const karyawanRouter = require('./routes/karyawan.routes');
const versionRouter = require('./routes/version.routes');
const kegiatanRouter = require('./routes/kegiatan.routes');
const jobRouter = require('./routes/job.routes');
const kendaraanRouter = require('./routes/kendaraan.routes');
const monitoringRouter = require('./routes/monitoring.routes');
const perawatanRouter = require('./routes/perawatan.routes');
const permintaanRouter = require('./routes/permintaan.routes');
const authRouter = require('./routes/auth.routes');
const notificationsRouter = require('./routes/notifications.routes');

const app = express();
const port = process.env.PORT || 4000;

const corsOptions = {
  origin: '*',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.options('*', cors(corsOptions));

app.use(cors(corsOptions));

// Middleware untuk parsing JSON
app.use(express.json());
// Middleware untuk parsing form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/karyawan', karyawanRouter);
app.use('/api/app-version', versionRouter);
app.use('/api/kegiatan', kegiatanRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/kendaraan', kendaraanRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/perawatan', perawatanRouter);
app.use('/api/permintaan', permintaanRouter);
app.use('/api/auth', authRouter);
app.use('/api/notifications', notificationsRouter);

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
