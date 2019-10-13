import 'core-js/es6/map'
import 'core-js/es6/set'

import path from 'path'

import React from 'react'
import ReactDOM from 'react-dom'
import {
  Router,
  Route,
  Link,
  Switch,
  IndexRoute
} from 'react-router-dom'

import App from './_components/App'

import './node_modules/antd/lib/style/index.less'
import './node_modules/antd/lib/style/components.less'
import './css/app.scss'

import { Provider } from 'react-redux'
import { createStore, combineReducers, compose } from 'redux'

import { CookiesProvider } from 'react-cookie'

import AuthReducer from './__reducers/auth'
import LocalizationReducer from './__reducers/localization'
import FullNameReducer from './__reducers/fullName'

import createHistory from 'history/createBrowserHistory'

const rootReducer = combineReducers({
  auth: AuthReducer,
  localization: LocalizationReducer,
  fullName: FullNameReducer,
})

const initialState = {
  localization: {
    language: 'en-ca'
  },
  fullName: '',
}
const store = createStore(
 rootReducer,
 initialState
)

const history = createHistory()
history.listen((location, action) => {
  const addressToUseForGA = "https://app.atschooltoday.net" + location.pathname + location.search
  window.gtag('set', 'page', addressToUseForGA)
  window.gtag('send', 'pageview', addressToUseForGA)
})

const render = Component => {
  ReactDOM.render(
    <Provider store={store}>
      <CookiesProvider>
        <div className="app">
          <Router basename={'/'} history={history}>
            <Route path="" component={Component} />
          </Router>
        </div>
      </CookiesProvider>
    </Provider>,
    document.getElementById('root'),
  )
}

render(App)

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./_components/App', () => { render(App) })
}