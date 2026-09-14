(()=>{
  function requireClient(){
    const c=window.FlorinGoTravel?.client;
    if(!c)throw new Error('travel_client_not_ready');
    return c;
  }

  async function userId(){
    const c=requireClient();
    const {data,error}=await c.auth.getUser();
    if(error)throw error;
    if(!data.user)throw new Error('not_authenticated');
    return data.user.id;
  }

  async function listTrips(){
    const c=requireClient();
    const uid=await userId();
    const {data,error}=await c
      .from('travel_trip_members')
      .select('role,joined_at,travel_trips(id,title,destination,start_date,end_date,cover_url,accent_color,status,owner_id)')
      .eq('user_id',uid)
      .order('joined_at',{ascending:false});
    if(error)throw error;
    return (data||[]).map(x=>({...x.travel_trips,role:x.role,joined_at:x.joined_at})).filter(Boolean);
  }

  async function loadTrip(tripId){
    const c=requireClient();
    const [trip,days,lodgings,bookings,members]=await Promise.all([
      c.from('travel_trips').select('*').eq('id',tripId).single(),
      c.from('travel_days').select('*').eq('trip_id',tripId).order('day_number'),
      c.from('travel_lodgings').select('*').eq('trip_id',tripId).order('day_number'),
      c.from('travel_bookings').select('*').eq('trip_id',tripId).order('starts_at'),
      c.from('travel_trip_members').select('user_id,role,joined_at').eq('trip_id',tripId).order('joined_at')
    ]);
    const err=[trip,days,lodgings,bookings,members].find(x=>x.error)?.error;
    if(err)throw err;
    return {trip:trip.data,days:days.data||[],lodgings:lodgings.data||[],bookings:bookings.data||[],members:members.data||[]};
  }

  async function getMyChecklist(tripId){
    const c=requireClient(),uid=await userId();
    const {data,error}=await c.from('travel_checklist_items').select('*').eq('trip_id',tripId).eq('user_id',uid).order('created_at');
    if(error)throw error; return data||[];
  }

  async function addChecklistItem(tripId,text){
    const c=requireClient(),uid=await userId();
    const {data,error}=await c.from('travel_checklist_items').insert({trip_id:tripId,user_id:uid,text}).select().single();
    if(error)throw error; return data;
  }

  async function toggleChecklistItem(id,isChecked){
    const c=requireClient();
    const {data,error}=await c.from('travel_checklist_items').update({is_checked:!!isChecked}).eq('id',id).select().single();
    if(error)throw error; return data;
  }

  async function listNotes(tripId){
    const c=requireClient();
    const {data,error}=await c.from('travel_notes').select('*').eq('trip_id',tripId).order('created_at',{ascending:false});
    if(error)throw error; return data||[];
  }

  async function addNote(tripId,content){
    const c=requireClient(),uid=await userId();
    const {data,error}=await c.from('travel_notes').insert({trip_id:tripId,author_id:uid,content}).select().single();
    if(error)throw error; return data;
  }

  async function listExpenses(tripId){
    const c=requireClient();
    const {data,error}=await c.from('travel_expenses').select('*').eq('trip_id',tripId).order('created_at',{ascending:false});
    if(error)throw error; return data||[];
  }

  async function addExpense(tripId,{description,amount,currency='EUR',paidByUserId=null,paidByLabel=null}){
    const c=requireClient(),uid=await userId();
    const {data,error}=await c.from('travel_expenses').insert({trip_id:tripId,created_by:uid,paid_by_user_id:paidByUserId,paid_by_label:paidByLabel,description,amount,currency}).select().single();
    if(error)throw error; return data;
  }

  async function createTrip({title,destination,startDate=null,endDate=null}){
    const c=requireClient();
    const {data,error}=await c.rpc('travel_create_trip',{p_title:title,p_destination:destination,p_start_date:startDate||null,p_end_date:endDate||null});
    if(error)throw error; return data;
  }

  async function createInvite(tripId,{role='traveler',expiresInDays=30,maxUses=20}={}){
    const c=requireClient();
    const {data,error}=await c.rpc('travel_create_invite',{p_trip_id:tripId,p_role:role,p_expires_in_days:expiresInDays,p_max_uses:maxUses});
    if(error)throw error; return data;
  }

  async function acceptInvite(code){
    const c=requireClient();
    const {data,error}=await c.rpc('travel_accept_invite',{p_code:String(code||'').trim()});
    if(error)throw error; return data;
  }

  window.TravelData={
    listTrips,loadTrip,getMyChecklist,addChecklistItem,toggleChecklistItem,
    listNotes,addNote,listExpenses,addExpense,createTrip,createInvite,acceptInvite
  };
})();
