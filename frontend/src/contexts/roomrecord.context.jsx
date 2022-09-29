import React, { useContext, useEffect, useRef } from 'react'
import { useMutation } from 'react-query';
import { AuthContext } from './auth.context'
import { CalendarContext } from './calendar.context';
import { AppContext } from './app.context';
import axios from 'axios';
import moment from 'moment';

export const RoomRecordsContext = React.createContext(null)
export const LOCALSTORAGE_ROOMRECORDS_KEY = "ROOM_RECORDS";
export const CONFIG_ROOMRECORDS_KEY = "daysToShow";


export const RoomRecordsProvider = ({ children }) => {
  
  const { date }           = useContext(CalendarContext);
  const { authentication } = useContext(AuthContext);
  const { config, add }    = useContext(AppContext);
  const [roomRecords, setRoomRecords] = React.useState([]);

  const recordsArray = useRef();

  const getRooms = useMutation(({ from, to }) => { 
    
    axios.get(config.getRoomRecords, {
    
    headers: {
      authorization: `Bearer ${ authentication.token }`
    },

    params: {
      from,
      to
    }

  })
  .then(({data}) => data)
  .then(data => setRoomRecords(data));
  });

  const _createRecord = useMutation(record => axios.post(config["postRoomRecord"], record, { headers: { authorization: `Bearer ${authentication.token}` }}).then(resp => { setRoomRecords(prev => [...prev, {...record, user: { name: record.userName, id: record.id }}]) }) );
  const _deleteRecord = useMutation(id => axios.delete(`${config["deleteRoomRecord"]}/${id}`, {}, { headers: { authorization: `Bearer ${authentication.token}` } }).then(resp => setRoomRecords(prev => prev.filter( record => record.id !== id ))));

  useEffect(() => {

      if(!authentication?.isAuthenticated) {
        return;
      }

      const storageData = sessionStorage.getItem(LOCALSTORAGE_ROOMRECORDS_KEY) ?? "[]"
      let daysToShow = config[CONFIG_ROOMRECORDS_KEY]
      
      if(!daysToShow) {
        add({ daysToShow: 7})
        daysToShow = 7;
      }

      if(!JSON.parse(storageData).length) { 
        getRooms.mutate({ from: moment(date).toISOString(), to: moment(date).add(daysToShow, 'd').toISOString() });
        return;
      }

      setRoomRecords(JSON.parse(storageData));

  }, [])


  const load = React.useCallback((from = moment(date), to = moment(date).add(config[CONFIG_ROOMRECORDS_KEY], 'd')) => {
      
    for (const m = moment(from); m.isBefore(to); m.add(1, 'days')) {
      
    }


  }, [date])

  const createRecord = React.useCallback(record => {
    _createRecord.mutate(record)

  }, [])

  const deleteRecord = React.useCallback(id => {
    _deleteRecord.mutate(id)
  }, [])


  return (
    <RoomRecordsContext.Provider value={{ isLoading: getRooms.isLoading, load, createRecord, deleteRecord, records: roomRecords }}>
      {children}
    </RoomRecordsContext.Provider>
  )

}

export default RoomRecordsProvider