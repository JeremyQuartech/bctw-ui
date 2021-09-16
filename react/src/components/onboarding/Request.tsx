import 'styles/form.scss';

import { Box, Grid } from '@material-ui/core';
import { Button, FormControl, InputLabel, NativeSelect, OutlinedInput, TextField, TextareaAutosize } from "@material-ui/core";
import { createUrl } from 'api/api_helpers';
import { useState } from "react";

const UserAccessRequest = (): JSX.Element => {

  /**
   * Would be nice if we could have all our styling inline Victor.
   * Although if you wanna reuse elsewhere I'm not too worried about
   * using a css file.
   */
  const styleMeVictor = {
    padding: '20px'
  };

  /**
   * Here is all our form state.
   */
  const [accessType, setAccessType] = useState('');
  const [populationUnit, setPopulationUnit] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectRole, setProjectRole] = useState('');
  const [reason, setReason] = useState('');
  const [region, setRegion] = useState('');
  const [species, setSpecies] = useState('');
  const [textMessageNumber, setTextMessageNumber] = useState('');

  /**
   * ## submitForm
   * Form payload and submit.
   */
  const submitRequest = () => {
    const payload = {
      accessType,
      populationUnit,
      projectManager,
      projectName,
      projectRole,
      reason,
      region,
      species,
      textMessageNumber
    }

    const url = createUrl({ api: 'onboarding' });

    // XXX: This url doesn't work in development
    // There is no keycloak in development duh!

    console.log('POSTing to this URL:', url);
    const request = new Request(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    fetch(request)
      .then((res) => {
        console.log('Your request was sent successfully:', res);
      })
      .catch((err) => {
        console.error('Your request was NOT sent successfully:', err);
      });

  }

  return (
    <Box px={4} py={3}>
      <Box className="fieldset-form">
        <h1>Request Access</h1>
        <div>
          <p>
            You will need to provide some additional details before accessing this application. Complete the request details form below to obtain access.
          </p>
        </div>
        <h3>Request Details</h3>
        <div>
          <span>Complete the following information:</span>
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField label='Project Name' onChange={(e) => { setProjectName(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Role in Project' onChange={(e) => { setProjectRole(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Project Manager' onChange={(e) => { setProjectManager(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Target Species' onChange={(e) => { setSpecies(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Region' onChange={(e) => { setRegion(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Population Unit Name' onChange={(e) => { setPopulationUnit(e.target.value) }} size='small' variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
            <FormControl className={'select-control'} size='small' variant={'outlined'}>
              <InputLabel>Target Level of Access</InputLabel>
              <NativeSelect onChange={(e) => { setAccessType(e.target.value) }} value={accessType} variant={'outlined'}>
                <option value={''}></option>
                <option value={'Administrator'}>Administrator</option>
                <option value={'Manager'}>Manager</option>
                <option value={'Editor'}>Editor</option>
                <option value={'Observer'}>Observer</option>
              </NativeSelect>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextareaAutosize placeholder="Describe the reason for wanting access to this application" onChange={(e) => { setReason(e.target.value) }} />
          </Grid>
          <Grid item xs={12}>
            <TextField label='Mobile Number to Receive Text Messages' onChange={(e) => { setTextMessageNumber(e.target.value) }} variant={'outlined'} />
          </Grid>
          <Grid item xs={12}>
              <Button variant='contained' color='primary' onClick={submitRequest}>Submit</Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default UserAccessRequest;