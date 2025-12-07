import router from '@adonisjs/core/services/router'
import QuizzesController from '#controllers/quizzes_controller'
import UsersController from '#controllers/users_controller'
import QuestionsController from '#controllers/questions_controller'
import ResultsController from '#controllers/results_controller'
import UserAnswersController from '#controllers/user_answers_controller'
import SessionController from '#controllers/auth_controller'
import SuperAdminController from '#controllers/superadmins_controller'
import { middleware } from './kernel.js'
import NumbersController from '#controllers/numbers_controller'
import ExternalQuizController from '#controllers/open_trivias_controller'

router.post('/register', [SessionController, 'register'])
router.post('/login', [SessionController, 'login'])
router.post('/refresh', [SessionController, 'refresh'])

router.get('/', async () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router.get('/users', [UsersController, 'index']).use(middleware.role(['superadmin', 'admin']))
    router
      .get('/users/:id', [UsersController, 'show'])
      .use(middleware.role(['superadmin', 'admin', 'user']))
    router.post('/users', [UsersController, 'store']).use(middleware.role(['superadmin', 'admin']))
    router
      .put('/users/:id', [UsersController, 'update'])
      .use(middleware.role(['superadmin', 'admin', 'user']))
    router
      .delete('/users/:id', [UsersController, 'destroy'])
      .use(middleware.role(['superadmin', 'admin']))

    router
      .get('/quizzes', [QuizzesController, 'index'])
      .use(middleware.role(['superadmin', 'admin', 'user']))
    router
      .get('/quizzes/:id', [QuizzesController, 'show'])
      .use(middleware.role(['superadmin', 'admin', 'user']))
    router
      .post('/quizzes', [QuizzesController, 'store'])
      .use(middleware.role(['superadmin', 'admin']))
    router
      .put('/quizzes/:id', [QuizzesController, 'update'])
      .use(middleware.role(['superadmin', 'admin']))
    router
      .delete('/quizzes/:id', [QuizzesController, 'destroy'])
      .use(middleware.role(['superadmin', 'admin']))

    router
      .get('/result', [ResultsController, 'index'])
      .use(middleware.role(['superadmin', 'admin']))
    router
      .get('/result/:id', [ResultsController, 'show'])
      .use(middleware.role(['superadmin', 'admin', 'user']))
    router
      .post('/result', [ResultsController, 'store'])
      .use(middleware.role(['superadmin', 'admin']))
    router
      .put('/result/:id', [ResultsController, 'update'])
      .use(middleware.role(['superadmin', 'admin']))
    router
      .delete('/result/:id', [ResultsController, 'destroy'])
      .use(middleware.role(['superadmin', 'admin']))

    router
      .get('/user_answers', [UserAnswersController, 'index'])
      .use(middleware.role(['superadmin', 'admin']))
    router
      .get('/user_answers/:id', [UserAnswersController, 'show'])
      .use(middleware.role(['superadmin', 'admin', 'user']))
    router.post('/user_answers', [UserAnswersController, 'store']).use(middleware.role(['user']))
    router
      .put('/user_answers/:id', [UserAnswersController, 'update'])
      .use(middleware.role(['superadmin', 'admin']))
    router
      .delete('/user_answers/:id', [UserAnswersController, 'destroy'])
      .use(middleware.role(['superadmin', 'admin']))

    router
      .get('/questions', [QuestionsController, 'index'])
      .use(middleware.role(['superadmin', 'admin']))
    router
      .get('/questions/:id', [QuestionsController, 'show'])
      .use(middleware.role(['superadmin', 'admin']))
    router
      .post('/questions', [QuestionsController, 'store'])
      .use(middleware.role(['superadmin', 'admin']))
    router
      .put('/questions/:id', [QuestionsController, 'update'])
      .use(middleware.role(['superadmin', 'admin']))
    router
      .delete('/questions/:id', [QuestionsController, 'destroy'])
      .use(middleware.role(['superadmin', 'admin']))
    router.get('/numbers/random', [NumbersController, 'random']).use(middleware.role(['superadmin', 'admin', 'user']))
    router.get('/external/trivia', [ExternalQuizController, 'getTrivia']).use(middleware.role(['superadmin', 'admin', 'user']))
  })
  .prefix('/api')
  .use(middleware.auth())

router
  .group(() => {
    router.patch('/role/:id', [SuperAdminController, 'updateRole'])
  })
  .prefix('/superadmin')
  .use(middleware.auth())



