import React from 'react';
import ReactNotification from 'react-notifications-component';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './AppGlobalStyle';
import theme from './AppTheme';
import { GlobalStateProvider } from './GlobalStateProvider';
import { NavigationBarComponent } from './views/components/navigation/NavigationBar';
import HomePage from './views/pages/Home.page';
import DatabasePage from './views/pages/database/Database/Database.page';
import PSDKUpdatePage from './views/pages/PSDKUpdate.page';
import MapLinkPage from './views/pages/mapLink/MapLink.page';
import DashboardRouter from '@pages/dashboard/Dashboard.Router.page';
import { Loader } from '@components/Loader';
import { LoaderContextProvider } from '@utils/loaderContext';
import { UnsavedWarningModal } from '@components/modals/UnsavedWarningModal';

const App = () => {
  return (
    <GlobalStateProvider>
      <LoaderContextProvider>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <UnsavedWarningModal />
          <Router>
            <NavigationBarComponent />
            <Switch>
              <Route exact strict path="/home" component={HomePage} />
              <Route strict path="/dashboard" component={DashboardRouter} />
              <Route exact strict path="/psdkupdate" component={PSDKUpdatePage} />
              <Route strict path="/database" component={DatabasePage} />
              <Route exact strict path="/map" component={MapLinkPage} />
              <Route exact strict path="/code" />
              <Route exact strict path="/help" />
              <Route exact strict path="/settings" />
              <Route exact strict path="/account" />
              <Redirect exact strict path="*" to="/home" />
            </Switch>
          </Router>
          <Loader />
          <ReactNotification />
        </ThemeProvider>
      </LoaderContextProvider>
    </GlobalStateProvider>
  );
};

export default App;
