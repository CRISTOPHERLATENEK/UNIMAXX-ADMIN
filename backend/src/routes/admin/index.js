const router = require('express').Router();
const { authenticateToken } = require('../../middleware/auth');

// Aplica autenticação em todas as rotas admin
router.use(authenticateToken);

router.use('/',                require('./content'));
router.use('/solutions',       require('./solutions'));
router.use('/solution-pages',  require('./solution-pages'));
router.use('/generic-pages',   require('./generic-pages'));
router.use('/stats',           require('./stats'));
router.use('/banners',         require('./banners'));
router.use('/upload',          require('./upload'));
router.use('/',                require('./social'));   // logos, testimonials, partners
router.use('/leads',           require('./leads'));
router.use('/newsletter',      require('./newsletter'));
router.use('/analytics',       require('./analytics'));
router.use('/preview-tokens',  require('./preview-tokens'));
router.use('/trash',           require('./trash'));
router.use('/redirects',       require('./redirects'));

module.exports = router;
