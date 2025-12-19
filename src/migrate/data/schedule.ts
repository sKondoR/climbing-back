import { IEvent } from 'src/schedule/schedule.interfaces';

/* eslint-disable prettier/prettier */
export const SCHEDULE: IEvent[] = [
    {
        weekDay: 'Понедельник',
        fromTime: '17:00',
        toTime: '21:00',
        place: 'СевСтена Петра',
        type: 'BOULDER',
    },
    {
        weekDay: 'Среда',
        fromTime: '17:00',
        toTime: '21:00',
        place: 'Неолит',
        type: 'BOULDER',
    },
    {
        weekDay: 'Четверг',
        fromTime: '17:30',
        toTime: '19:00',
        place: 'Робототехника',
        type: 'HOBBY',
    },
    {
        weekDay: 'Пятница',
        fromTime: '17:00',
        toTime: '21:00',
        place: 'Неолит',
        type: 'BOULDER',
    },
    {
        weekDay: 'Воскресенье',
        fromTime: '12:00',
        toTime: '15:00',
        place: 'Луч',
        type: 'BOULDER',
    },
    {
        weekDay: 'Суббота',
        fromTime: '13:00',
        toTime: '17:00',
        place: 'СевСтена',
        type: 'LEAD',
    },
    {
        weekDay: 'Понедельник',
        fromTime: '9:00',
        toTime: '14:00',
        type: 'SCHOOL',
        place: 'школа'
    },
    {
        weekDay: 'Вторник',
        fromTime: '9:00',
        toTime: '14:00',
        type: 'SCHOOL',
        place: 'школа'
    },
    {
        weekDay: 'Среда',
        fromTime: '9:00',
        toTime: '14:00',
        type: 'SCHOOL',
        place: 'школа'
    },
    {
        weekDay: 'Четверг',
        fromTime: '9:00',
        toTime: '15:00',
        type: 'SCHOOL',
        place: 'школа'
    },
    {
        weekDay: 'Пятница',
        fromTime: '9:00',
        toTime: '14:00',
        type: 'SCHOOL',
        place: 'школа'
    },
    {
        weekDay: 'Вторник',
        fromTime: '16:50',
        toTime: '18:30',
        place: 'Рисование',
        type: 'HOBBY',
    },
];