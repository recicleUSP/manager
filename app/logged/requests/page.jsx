'use client';
import React, {useEffect, useState} from 'react';
import {GetUsersRequests} from '../../../services/user';
import { RegisterUser, RemoveUserRequest } from '../../../services/user';
import { getAccessDennyHtml, getAccessAcceptHtml} from '../../../services/emailsTemplate'
import { sendEmail } from '../../../services/sendEmail';

import ListChoice from '../components/list';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

export default function Requests() {
    const [error, setError] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const unsubscribe = GetUsersRequests((data)=>{
            setRequests(data);
        })
        return () => unsubscribe();
    },[])


    function handleAcept(user){
        RegisterUser(user, (code, message)=>{
            if(code === 200){
                sendEmail(user.email, 'Cadastro Aprovado (Recicle++)', 
                    getAccessAcceptHtml('http://localhost:3000/sign', user.name, user.email, 'Recicle++ (Donor)'))
                setSuccess({code, message});
            }else{
                setError({code, message});
            }
        })
    }

    function handleDeny(user){
        RemoveUserRequest(user.id, (code, message)=>{
            if(code === 200){
                sendEmail(user.email, 'Cadastro Negado (Recicle++)', getAccessDennyHtml(user.name, "Recicle++ (Donor)"))
                setSuccess({code, message});
            }else{
                setError({code, message});
            }
        })
    }

    
    
    return (
        requests.length === 0 ? <Typography variant="h5" component="div" gutterBottom>Não há solicitações de cadastro</Typography>
        :
        <>
            <Typography variant="h5" component="div" gutterBottom>Solicitações de Cadastro</Typography>
            <ListChoice data={requests} handleAcept={handleAcept} handleDeny={handleDeny}/>

            
            <Snackbar open={!!error} autoHideDuration={6000} onClose={()=>setError(false)}>
                <Alert onClose={()=>setError(false)} severity="error" sx={{ width: '100%' }}>
                    Code: {error.code} - {error.message}
                </Alert>
            </Snackbar>

            <Snackbar open={!!success} autoHideDuration={6000} onClose={()=>setSuccess(false)}>
                <Alert onClose={()=>setSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    {success.code} - {success.message}
                </Alert>
            </Snackbar>
        </>
    )
}

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});