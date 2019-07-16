import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './scss/main.css'
import './setup/extensions'
import registerInterceptors from './setup/interceptors'

registerInterceptors()
ReactDOM.render(<App />, document.getElementById('root'))
