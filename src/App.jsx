import React from "react";
import { Typography, AppBar, Card, CardActions, CardMedia, CssBaseline, Grid, Toolbar, Container } from '@material-ui/core';
import { PhotoCamera } from "@material-ui/icons";
import { TextField } from "@material-ui/core";



const App = () => {
    return(
    <>
    
        <CssBaseline />
        <AppBar position="relative">
            <Toolbar>
                <PhotoCamera />
                <Typography variant="h6">
                    Sand analysis
                </Typography>
            </Toolbar>
        </AppBar> 
        <main>
            <div>
                <Container maxWidth="sm">
                    <Typography variant="h2" align="center" color="textPrimary" gutterBottom>
                        Sand analysis
                    </Typography>
                    <Typography variant="h5" align="center" color="textSecondary" paragraph>
                        Add the values from the sand analysis here
                    </Typography>
                    <Container maxWidth="sm">
                    <TextField id="Ecosil" label="Ecosil" variant="filled" placeholder="Dog fur" />
                    </Container>
                    <Container maxWidth="sm">
                    <TextField id="Bentonitt" label="Bentonitt" variant="filled" placeholder="Dog fur" />
                    </Container>
                </Container>
            </div>

        </main>
    </>
    );

}


export default App;

