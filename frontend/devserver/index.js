import express from "express";
import jwt from "jsonwebtoken";
import bodyparser from "body-parser";
import cors from "cors";
import bearerToken from 'express-bearer-token';
import moment from "moment";

import roomWithRecords from './roomWithRecords.js';
import roomRecords from './roomsRecords.js';
import users from './users.js';

const { json, urlencoded } = bodyparser;
const supersecret = "supersecret";

express()
  .use(urlencoded({ extended: true }))
  .use(json())
  .use(cors())
  .use(bearerToken({
    bodyKey: 'authorization',
    queryKey: 'authorization',
    headerKey: 'Bearer',
    reqKey: 'authorization',
  }))
  
  //returns the current user table from id
  .get("/api/user/GetUsers", (req, res) => {
    
    const authorization = req.headers.authorization;

    if(!authorization || authorization == "Bearer null") {
      return res.sendStatus(403);
    }
    
    const { userName, adminAccess } = jwt.decode(req.authorization, supersecret);
    
    if(!userName) {
      return res.send(users.find(({id}) => id === id))
    }

    if(adminAccess) {
      return res.json(users);
    }

    else {
      return res.json([])
    }

  })

  .get("/api/rooms", (req, res) => {
    return res.send([
      {
        id: 1,
        name: "Room1",
        roomCapacity: 2,
      },
      {
        id: 7,
        name: "Room2",
        roomCapacity: 4,
      },
      {
        id: 8,
        name: "Room3",
        roomCapacity: 3,
      },
    ]);
  })

  //records
  .get("/api/RoomRecord", (req, res) => {

      const { authorization } = req;
      const { from, to } = req.query;

      if(!req.headers.authorization || req.headers.authorization == "Bearer null") {
        return res.sendStatus(403)
      }
 
      const _dateFrom = from ? moment(from) : moment();
      const _dateTo = to ? moment(to) : moment(_dateFrom).add(7, 'days');

      const { userName } = jwt.decode(authorization, supersecret);
      
      if(!userName) {
        res.sendStatus(403)
        return
      }

      const _records = roomWithRecords.filter(({date}) => moment(date).isSameOrAfter(_dateFrom) && moment(date).isSameOrBefore(_dateTo))
      
      if(!_records.length) { res.send([]); return;}
      
      return res.json(_records)
  })

  .post("/api/RoomRecord", (req, res) => {
    
      const authorization = req.headers.authorization;
      console.log(authorization)
      
      if(!authorization || authorization == "Bearer null") {
        res.sendStatus(403);
        return
      }     
      
      const { userName } = jwt.decode(req.authorization, supersecret);
      
      if(!userName) {
        
        res.sendStatus(403)
        return
      }

      const {
        date,
        user_id,
        room_id,
      } = req.body

      if(!date || !user_id || !room_id) {
        res.sendStatus(406)
        return
      }

      console.log("HERE");

      const _finded = roomRecords.filter(roomRecord => moment(roomRecord.date).format("YYYY-MM-DD") === moment(date).format("YYYY-MM-DD") && roomRecord.userId === user_id)

      if(_finded.length > 0) {
        res.sendStatus(409)
        return
      }


      roomRecords.push({
        id: roomWithRecords.at(-1).id += 1,
        room_id,
        date,
        user: { id: user_id, name: "Somebody somebody" }
      })

      res.sendStatus(200)

  })

  .delete("/api/RoomRecord/:id", (req, res) => {
    
    const { id } = req.params;
    
    if(!id || !Number.isInteger(id)) {
      res.status(404).json({ message: "NOT_FOUND" })
      return;
    }

    const finded = roomRecords.find((roomRecord) => roomRecord.id === id);
    
    if(!finded) {
      res.sendStatus(404);
      return;
    }
    
    roomRecords = roomRecords.filter(room => room !==finded)
    res.sendStatus(200);
  })

  .post("/api/user/AuthenticateTokenOnly", async (req, res) => {

    if (!req.body.username) {
      return await Promise.reject(res.sendStatus(404));
    }

    const _founded = users.find((u) => u.userName === req.body.username)
    
    if(!_founded) {
      return res.sendStatus(404);
    }

    const { userName, adminAccess } = _founded;

    if (!userName) {res.sendStatus(404); return }

    const token = jwt.sign({ userName, adminAccess  }, supersecret);

    return res.send(token);
    //return setTimeout(() => res.send(token), 700);
  })

  .get("/api/user/GetUserData", async (req, res) => {
    const authorization = req.headers.authorization;

    if(!authorization || authorization == "Bearer null") {
      res.sendStatus(403);
      return;
    }
    
    const { userName } = jwt.decode(req.authorization, supersecret);
    
    if(userName) {
      const _findedUser = users.find(_user => _user.userName == userName);
      return res.send(_findedUser)
    }

    return res.sendStatus(404);
  })

  .put("/api/{id}", async (req, res) => {

  })

  .delete("/api/{id}", async (req, res) => {

  })

  .listen(1337);

