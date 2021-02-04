import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './AppGlobalStyle';
import theme from './AppTheme';
import { GlobalStateProvider } from './GlobalStateProvider';
import { NavigationBarComponent } from './views/components/navigation/NavigationBar';
import HomePage from './views/pages/Home.page';
import DatabasePage from './views/pages/database/Database/Database.page';

export default function App() {
  return (
    <GlobalStateProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Router>
          <NavigationBarComponent />
          <Switch>
            <Route exact strict path="/home" component={HomePage} />
            <Route exact strict path="/dashboard" />
            <Route exact strict path="/update" />
            <Route strict path="/database" component={DatabasePage} />
            <Route exact strict path="/map" />
            <Route exact strict path="/code" />
            <Route exact strict path="/help" />
            <Route exact strict path="/settings" />
            <Route exact strict path="/account" />
            <Redirect exact strict path="*" to="/home" />
          </Switch>
        </Router>
      </ThemeProvider>
    </GlobalStateProvider>
  );
}
