const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// Tất cả admin routes yêu cầu đăng nhập + role admin
router.use(protect, adminOnly);

// Stats
router.get('/stats', ctrl.getStats);

// Movies CRUD
router.get('/movies',       ctrl.listMovies);
router.post('/movies',      ctrl.createMovie);
router.get('/movies/:id',   ctrl.getMovie);
router.put('/movies/:id',   ctrl.updateMovie);
router.delete('/movies/:id', ctrl.deleteMovie);

// Episodes management
router.get('/movies/:id/episodes',                                      ctrl.getEpisodes);
router.post('/movies/:id/servers',                                      ctrl.addServer);
router.put('/movies/:id/servers/:serverId',                             ctrl.updateServer);
router.delete('/movies/:id/servers/:serverId',                          ctrl.deleteServer);
router.post('/movies/:id/servers/:serverId/episodes',                   ctrl.addEpisode);
router.put('/movies/:id/servers/:serverId/episodes/:epId',              ctrl.updateEpisode);
router.delete('/movies/:id/servers/:serverId/episodes/:epId',           ctrl.deleteEpisode);

// Categories
router.get('/categories',       ctrl.listCategories);
router.post('/categories',      ctrl.createCategory);
router.delete('/categories/:id', ctrl.deleteCategory);

// Countries
router.get('/countries',       ctrl.listCountries);
router.post('/countries',      ctrl.createCountry);
router.delete('/countries/:id', ctrl.deleteCountry);

module.exports = router;
