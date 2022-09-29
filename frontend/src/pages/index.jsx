import { Router } from '@reach/router'
import { CalendarPage } from './app'
import { Index, LoginPage, NotFound } from './home'


export const AnonymouseRoutes = () => {

  return (
    <Router>
      <Index path="/" />
      <NotFound path="/notfound" default/>
      <LoginPage path="/login"/>
    </Router>
  )
}

export const AuthenticatedRoutes = () => {

  return (
    <Router>
      <CalendarPage path="/"/>
      <NotFound path="/notfound" default/>
    </Router>
  )
}

export default AnonymouseRoutes