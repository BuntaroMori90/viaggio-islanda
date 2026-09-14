/*
  Schema dati per una nuova destinazione.
  Questo file è intenzionalmente generico: va copiato/compilato per il nuovo viaggio.
*/
window.TRIP_CONFIG = {
  id: 'destinazione-anno',
  title: 'DESTINAZIONE 20XX',
  destination: 'Destinazione',
  startDate: '20XX-01-01',
  endDate: '20XX-01-08',
  departureAt: '20XX-01-01T08:00:00+01:00',
  people: [],

  hero: {
    eyebrow: 'ROAD TRIP · DESTINAZIONE',
    image: '',
    accent: '#ff5a1f'
  },

  flights: [
    // { at:'', from:'', to:'', airline:'', flightNumber:'', bookingRef:'' }
  ],

  lodgings: [
    // { date:'', name:'', address:'', phone:'', checkIn:'', checkOut:'', parking:'' }
  ],

  bookings: [
    // { at:'', title:'', location:'', people:0, status:'confirmed' }
  ],

  days: [
    /*
    {
      num: 1,
      date: '20XX-01-01',
      title: 'Titolo giornata',
      location: '',
      lat: 0,
      lon: 0,
      schedule: [ ['08:30','Tappa','Nota'] ],
      must: [],
      bonus: [],
      sacrificabili: [],
      cutoffs: [
        { time:'16:00', condition:'Se...', action:'...', level:'reduce' }
      ],
      fuel: '',
      food: '',
      mapUrl: ''
    }
    */
  ],

  utilityApps: [
    // { name:'', description:'', url:'', tag:'' }
  ],

  currency: {
    from: 'XXX',
    to: 'EUR',
    provider: 'frankfurter-v2'
  },

  emergency: {
    number: '112',
    health: '',
    roadStatusUrl: '',
    safetyUrl: ''
  },

  budget: [
    // { voice:'Volo', note:'', value:0 }
  ],

  backend: {
    tripId: 'destinazione-anno',
    useTripId: true
  }
};
