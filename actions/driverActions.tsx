import { CALL_API, Schemas } from '../middleware/api';
import { Alert } from 'react-native';
import { getSpecificUser } from './userActions';
import { getDSPR } from './dsprActions';
import * as RootNavigation from '../navigation/RootNavigation';

export const ASSIGN_DSPR_DRIVER = 'ASSIGN_DSPR_DRIVER';
export const ASSIGN_DSPR_DRIVER_SUCCESS = 'ASSIGN_DSPR_DRIVER_SUCCESS';
export const ASSIGN_DSPR_DRIVER_FAILURE = 'ASSIGN_DSPR_DRIVER_FAILURE';

const dsprDriverAssigner = (dsprId, driverUserId, onCall) => {
  const dsprDriver = {
    dspr: {
      id: dsprId,
    },
    user: {
      id: driverUserId,
    },
    onCall: onCall === undefined ? false : onCall,
  };

  return {
    [CALL_API]: {
      httpAction: 'POST',
      types: [ASSIGN_DSPR_DRIVER, ASSIGN_DSPR_DRIVER_SUCCESS, ASSIGN_DSPR_DRIVER_FAILURE],
      endPoint: 'dspr/driver',
      schema: Schemas.DSPR_DRIVER,
      body: dsprDriver,
    },
  };
};

export const assignDSPRDriver = (dsprId, driverUserId, onCall) => (dispatch, getState) => {
  return dispatch(dsprDriverAssigner(dsprId, driverUserId, onCall))
    .then(() => dispatch(getDSPR(dsprId)))
    .then(() => dispatch(getSpecificUser(driverUserId)));
};

export const SET_DSPR_DRIVER_ID = 'SET_DSPR_DRIVER_ID';
export const GET_DSPR_DRIVER = 'GET_DSPR_DRIVER';
export const GET_DSPR_DRIVER_SUCCESS = 'GET_DSPR_DRIVER_SUCCESS';
export const GET_DSPR_DRIVER_FAILURE = 'GET_DSPR_DRIVER_FAILURE';
export const DRIVER_DATA_PENDING = 'DRIVER_DATA_PENDING';

const setDriverId = (driverId) => {
  return { type: SET_DSPR_DRIVER_ID, payload: driverId };
};

export const setDsprDriverId = (dsprDriverId) => (dispatch) => {
  dispatch(setDriverId(dsprDriverId));
  RootNavigation.navigate('Main', {
    screen: 'Dashboard',
  });
};

const dsprDriverGetter = (dsprDriverId) => {
  return {
    [CALL_API]: {
      httpAction: 'GET',
      types: [GET_DSPR_DRIVER, GET_DSPR_DRIVER_SUCCESS, GET_DSPR_DRIVER_FAILURE],
      endPoint: `dspr/driver/${dsprDriverId}`,
      schema: Schemas.DSPR_DRIVER,
    },
  };
};

export const getDSPRDriver = (dsprDriverId) => (dispatch, getState) => {
  dispatch({ type: DRIVER_DATA_PENDING });
  dispatch(dsprDriverGetter(dsprDriverId))
    .then((response) => {
      if (response.type === GET_DSPR_DRIVER_FAILURE) {
        Alert.alert('ERROR', 'Failed to fetch driver data.');
      }
    })
    .catch((error) => console.log(error));
};

export const refreshDSPRDriver = (dsprDriverId) => (dispatch, getState) => {
  dispatch(dsprDriverGetter(dsprDriverId)).catch((error) => {
    console.log(error);
  });
};

export const GET_ALL_DRIVERS_FOR_DSPR = 'GET_ALL_DRIVERS_FOR_DSPR';
export const GET_ALL_DRIVERS_FOR_DSPR_SUCCESS = 'GET_ALL_DRIVERS_FOR_DSPR_SUCCESS';
export const GET_ALL_DRIVERS_FOR_DSPR_FAILURE = 'GET_ALL_DRIVERS_FOR_DSPR_FAILURE';

const allDriversForDsprGetter = (dsprId) => {
  return {
    [CALL_API]: {
      httpAction: 'GET',
      types: [
        GET_ALL_DRIVERS_FOR_DSPR,
        GET_ALL_DRIVERS_FOR_DSPR_SUCCESS,
        GET_ALL_DRIVERS_FOR_DSPR_FAILURE,
      ],
      endPoint: `dspr/driver/`,
      schema: Schemas.DSPR_DRIVER_ARRAY,
      queryParamsMap: { dspr_id: dsprId },
    },
  };
};

export const getAllDriversForDspr = (dsprId) => (dispatch) => {
  return dispatch(allDriversForDsprGetter(dsprId));
};

export const TOGGLE_DSPR_DRIVER_ACTIVE_STATUS = 'TOGGLE_DSPR_DRIVER_ACTIVE_STATUS';
export const TOGGLE_DSPR_DRIVER_ACTIVE_STATUS_SUCCESS = 'TOGGLE_DSPR_DRIVER_ACTIVE_STATUS_SUCCESS';
export const TOGGLE_DSPR_DRIVER_ACTIVE_STATUS_FAILURE = 'TOGGLE_DSPR_DRIVER_ACTIVE_STATUS_FAILURE';

const dsprDriverActiveStatusToggler = (dsprDriverId, isCurrentlyActive) => {
  const dsprDriver = {
    id: dsprDriverId,
  };

  return {
    [CALL_API]: {
      httpAction: 'POST',
      types: [
        TOGGLE_DSPR_DRIVER_ACTIVE_STATUS,
        TOGGLE_DSPR_DRIVER_ACTIVE_STATUS_SUCCESS,
        TOGGLE_DSPR_DRIVER_ACTIVE_STATUS_FAILURE,
      ],
      endPoint: isCurrentlyActive ? 'dspr/driver/deactivate' : 'dspr/driver/activate',
      schema: Schemas.DSPR_DRIVER,
      body: dsprDriver,
    },
  };
};

export const toggleDSPRDriverActiveStatus = (dsprDriverId) => (dispatch, getState) => {
  return dispatch(
    dsprDriverActiveStatusToggler(
      dsprDriverId,
      getState().api.entities.dsprDrivers[dsprDriverId].active
    )
  );
};

export const SET_ON_CALL_STATE_FOR_DRIVER_PENDING = 'SET_ON_CALL_STATE_FOR_DRIVER_PENDING';
export const SET_ON_CALL_STATE_FOR_DRIVER = 'SET_ON_CALL_STATE_FOR_DRIVER';
export const SET_ON_CALL_STATE_FOR_DRIVER_SUCCESS = 'SET_ON_CALL_STATE_FOR_DRIVER_SUCCESS';
export const SET_ON_CALL_STATE_FOR_DRIVER_FAILURE = 'SET_ON_CALL_STATE_FOR_DRIVER_FAILURE';

const driverOnCallStateSetter = (dsprDriverId, onCallString) => {
  const dsprDriver = {
    id: dsprDriverId,
  };
  const endpointString = onCallString === 'on' ? 'oncall' : 'notoncall';
  return {
    [CALL_API]: {
      httpAction: 'POST',
      types: [
        SET_ON_CALL_STATE_FOR_DRIVER,
        SET_ON_CALL_STATE_FOR_DRIVER_SUCCESS,
        SET_ON_CALL_STATE_FOR_DRIVER_FAILURE,
      ],
      endPoint: 'dspr/driver/' + endpointString,
      schema: Schemas.DSPR_DRIVER,
      body: dsprDriver,
    },
  };
};

export const setDriverOnCallState = (dsprDriverId, isOnCall) => (dispatch, getState) => {
  dispatch({ type: SET_ON_CALL_STATE_FOR_DRIVER_PENDING });
  dispatch(driverOnCallStateSetter(dsprDriverId, isOnCall))
    .then((response) => {
      if (response.type === SET_ON_CALL_STATE_FOR_DRIVER_FAILURE) {
        Alert.alert('ERROR', response.error);
      }
    })
    .catch((error) => console.log(error));
};

export const SET_DRIVER_LOCATION = 'SET_DRIVER_LOCATION';
export const SET_DRIVER_LOCATION_SUCCESS = 'SET_DRIVER_LOCATION_SUCCESS';
export const SET_DRIVER_LOCATION_FAILURE = 'SET_DRIVER_LOCATION_FAILURE';

const driverLocationSetter = (dsprId, latitude, longitude) => {
  const driverLocation = {
    longitude,
    latitude,
    dspr: {
      id: dsprId,
    },
  };

  return {
    [CALL_API]: {
      httpAction: 'POST',
      types: [SET_DRIVER_LOCATION, SET_DRIVER_LOCATION_SUCCESS, SET_DRIVER_LOCATION_FAILURE],
      endPoint: 'dspr/driver/location',
      schema: Schemas.DSPR_DRIVER_LOCATION,
      body: driverLocation,
    },
  };
};

export const SET_DRIVER_INFORMATION = 'SET_DRIVER_INFORMATION';
export const SET_DRIVER_INFORMATION_SUCCESS = 'SET_DRIVER_INFORMATION_SUCCESS';
export const SET_DRIVER_INFORMATION_FAILURE = 'SET_DRIVER_INFORMATION_FAILURE';

export const setDriverLocation = (dsprId, latitude, longitude) => (dispatch, getState) => {
  return dispatch(driverLocationSetter(dsprId, latitude, longitude));
};

const driverInformationSetter = (dsprDriverId, values) => {
  const information = {
    id: dsprDriverId,
    ...values,
  };

  return {
    [CALL_API]: {
      httpAction: 'POST',
      types: [
        SET_DRIVER_INFORMATION,
        SET_DRIVER_INFORMATION_SUCCESS,
        SET_DRIVER_INFORMATION_FAILURE,
      ],
      endPoint: 'dspr/driver/update',
      schema: Schemas.DSPR_DRIVER,
      body: information,
    },
  };
};
export const setUpdateDriverInformation = (dsprDriverId, values) => (dispatch, getState) => {
  return dispatch(driverInformationSetter(dsprDriverId, values));
};

export const CREATE_NEW_DSPR_DRIVER_ROUTE_PENDING = 'CREATE_NEW_DSPR_DRIVER_ROUTE_PENDING';
export const CREATE_NEW_DSPR_DRIVER_ROUTE = 'CREATE_NEW_DSPR_DRIVER_ROUTE';
export const CREATE_NEW_DSPR_DRIVER_ROUTE_SUCCESS = 'CREATE_NEW_DSPR_DRIVER_ROUTE_SUCCESS';
export const CREATE_NEW_DSPR_DRIVER_ROUTE_FAILURE = 'CREATE_NEW_DSPR_DRIVER_ROUTE_FAILURE';

const createNewRoute = (
  driverId: number,
  waypoints,
  finalDestination,
  usingFinalDestinationInRoute: Boolean
) => {
  const route = {
    dsprDriver: { id: driverId },
    waypoints,
    finalDestination,
    usingFinalDestinationInRoute,
  };
  return {
    [CALL_API]: {
      httpAction: 'POST',
      types: [
        CREATE_NEW_DSPR_DRIVER_ROUTE,
        CREATE_NEW_DSPR_DRIVER_ROUTE_SUCCESS,
        CREATE_NEW_DSPR_DRIVER_ROUTE_FAILURE,
      ],
      endPoint: 'dspr/driver/route',
      schema: Schemas.DSPR_DRIVER_ROUTE,
      body: route,
    },
  };
};

export const createDSPRDriverRoute = (
  driverId: number,
  waypoints,
  finalDestination,
  usingFinalDestinationInRoute: Boolean
) => (dispatch) => {
  dispatch({ type: CREATE_NEW_DSPR_DRIVER_ROUTE_PENDING });
  dispatch(
    createNewRoute(driverId, waypoints, finalDestination, usingFinalDestinationInRoute)
  ).then((response) => {
    if (response.type === CREATE_NEW_DSPR_DRIVER_ROUTE_FAILURE) {
      Alert.alert('Error', response.error);
    }
  });
};

export const CREATE_NEW_DSPR_DRIVER_ROUTE_WITHOUT_NOTIFICATIONS =
  'CREATE_NEW_DSPR_DRIVER_ROUTE_WITHOUT_NOTIFICATIONS';
export const CREATE_NEW_DSPR_DRIVER_ROUTE_WITHOUT_NOTIFICATIONS_SUCCESS =
  'CREATE_NEW_DSPR_DRIVER_ROUTE_WITHOUT_NOTIFICATIONS_SUCCESS';
export const CREATE_NEW_DSPR_DRIVER_ROUTE_WITHOUT_NOTIFICATIONS_FAILURE =
  'CREATE_NEW_DSPR_DRIVER_ROUTE_WITHOUT_NOTIFICATIONS_FAILURE';

const createNewRouteWithoutNotifications = (
  driverId: number,
  waypoints,
  finalDestination,
  usingFinalDestinationInRoute: Boolean
) => {
  const route = {
    dsprDriver: { id: driverId },
    waypoints,
    finalDestination,
    usingFinalDestinationInRoute,
  };

  return {
    [CALL_API]: {
      httpAction: 'POST',
      types: [
        CREATE_NEW_DSPR_DRIVER_ROUTE_WITHOUT_NOTIFICATIONS,
        CREATE_NEW_DSPR_DRIVER_ROUTE_WITHOUT_NOTIFICATIONS_SUCCESS,
        CREATE_NEW_DSPR_DRIVER_ROUTE_WITHOUT_NOTIFICATIONS_FAILURE,
      ],
      endPoint: 'dspr/driver/route/remakeWithoutNotifications',
      schema: Schemas.DSPR_DRIVER_ROUTE,
      body: route,
    },
  };
};
export const createDSPRDriverRouteWithoutNotifications = (
  driverId: number,
  waypoints,
  finalDestination,
  usingFinalDestinationInRoute: Boolean
) => (dispatch) => {
  return dispatch(
    createNewRouteWithoutNotifications(
      driverId,
      waypoints,
      finalDestination,
      usingFinalDestinationInRoute
    )
  );
};

export const PROGRESS_DSPR_DRIVER_ROUTE_PENDING = 'PROGRESS_DSPR_DRIVER_ROUTE_PENDING';
export const PROGRESS_DSPR_DRIVER_ROUTE = 'PROGRESS_DSPR_DRIVER_ROUTE';
export const PROGRESS_DSPR_DRIVER_ROUTE_SUCCESS = 'PROGRESS_DSPR_DRIVER_ROUTE_SUCCESS';
export const PROGRESS_DSPR_DRIVER_ROUTE_FAILURE = 'PROGRESS_DSPR_DRIVER_ROUTE_FAILURE';

const progressDriverRoute = (routeId: number) => {
  return {
    [CALL_API]: {
      httpAction: 'GET',
      types: [
        PROGRESS_DSPR_DRIVER_ROUTE,
        PROGRESS_DSPR_DRIVER_ROUTE_SUCCESS,
        PROGRESS_DSPR_DRIVER_ROUTE_FAILURE,
      ],
      endPoint: `dspr/driver/route/progress/${routeId}`,
      schema: Schemas.DSPR_DRIVER_ROUTE,
    },
  };
};
export const progressDSPRDriverRoute = (routeId: number) => (dispatch, getState) => {
  dispatch({ type: PROGRESS_DSPR_DRIVER_ROUTE_PENDING });
  return dispatch(progressDriverRoute(routeId))
    .then((response) => {
      if (response.type === PROGRESS_DSPR_DRIVER_ROUTE_SUCCESS) {
        const driverId = getState().api.dsprDriverId;
        dispatch(getDSPRDriver(driverId));
      }
      if (response.type === PROGRESS_DSPR_DRIVER_ROUTE_FAILURE) {
        Alert.alert('ERROR', response.error);
      }
    })
    .catch((error) => console.log(error));
};

export const DEACTIVATE_DSPR_DRIVER_ROUTE = 'DEACTIVATE_DSPR_DRIVER_ROUTE';
export const DEACTIVATE_DSPR_DRIVER_ROUTE_SUCCESS = 'DEACTIVATE_DSPR_DRIVER_ROUTE_SUCCESS';
export const DEACTIVATE_DSPR_DRIVER_ROUTE_FAILURE = 'DEACTIVATE_DSPR_DRIVER_ROUTE_FAILURE';

const deactivateDriverRoute = (routeId: number) => {
  const body = {
    id: routeId,
  };
  return {
    [CALL_API]: {
      httpAction: 'POST',
      types: [
        DEACTIVATE_DSPR_DRIVER_ROUTE,
        DEACTIVATE_DSPR_DRIVER_ROUTE_SUCCESS,
        DEACTIVATE_DSPR_DRIVER_ROUTE_FAILURE,
      ],
      endPoint: `dspr/driver/route/deactivate`,
      schema: Schemas.DSPR_DRIVER_ROUTE,
      body,
    },
  };
};
export const deactivateDSPRDriverRoute = (routeId: number) => (dispatch) => {
  return dispatch(deactivateDriverRoute(routeId));
};
