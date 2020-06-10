const express = require('express');
const cookieParser = require('cookie-parser')
const path = require('path')
const session = require('express-session');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const options = { expiresIn: '2d' };
const secret = 'vas2014eli';

const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session(
    { secret: '1234' },
    { httpOnly: true },
    { secure: false }
))
const users = [
    { id: 1, name: 'vasko', password: '111' },
    { id: 2, name: 'eli', password: '222' },
    { id: 3, name: 'velizar', password: '333' }
]
function auth(req, res, next) {
    // const currentUser = users.find(u => u.id === req.session.userId);
    const token = req.cookies['auth_cookie'];
    if (!token) {
        res.send('Please authonticate first!');
        return;
    }
    const data = jwt.verify(token, secret)
    const currentUser = users.find(u => u.id === data.userId);
    if (!currentUser) {
        res.status(401).send('Unatheticated USER!!!');
        return;
    }
    req.user = currentUser;
    next();
}
app.get('/login', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'pages', 'login.html'))
)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.name === username)
    if (!user) {
        res.send('User not exist!');
        return;
    }
    bcrypt.compare(password, user.password)
        .then(isAuth => {
            // if (re) { console.log(err); return; }
            // res.send('Password mismatch!');
            // req.session.userId = user.id;
            // res.redirect('/')
            if (!isAuth) {
                res.send('Password mismatch!');
                return;
            }
            const token = jwt.sign({ userId: user.id }, secret, options)
            // req.session.userId = user.id;
            console.log(token)
            res.cookie('auth_cookie', token).redirect('/')
        })
})
app.get('/logout', (req, res) => {
    res.clearCookie('auth_cookie')
    // req.session.destroy((err) => {
    //     if (err) {
    //         console.log(err);
    //         res.status('501').send(err.message);
    //         return;
    //     }
    //     res.redirect('/');
    // })
    return res.status(200).redirect('/login');
})
app.get('/', (req, res) => {
    res.send('Default Page');
})
app.get('/protected', auth, (req, res) => {
    res.send('This page is visible only for authicated users')
})
app.get('/protected2', auth, (req, res) => {
    res.send('This page 2 is visible only for authicated users')
})
app.get('/setcookie', (req, res) => {
    res.cookie('message', 'hello', { expires: new Date(Date.now() + 1800000) })
    res.end('Cookie set')
})
app.get('/readcookie', (req, res) => {
    res.send(JSON.stringify(req.cookies))
})
app.get('/register', (req, res) => {
    // console.log(path.join('D:/Users/Vasko/Desktop/Soft-Uni/Node.JS/authentication', 'pages/register.html'))
    // console.log(path.resolve('pages','register.html'))
    res.sendFile(path.resolve('pages', 'register.html'))
})
app.post('/register', (req, res, next) => {
    const { username, password } = req.body;
    // const id = users.length + 1;
    // users.push({ id, name: username, password });
    // console.log(users)
    // res.send('New user is added!')
    let user = users.find(u => u.name === username);
    if (user) {
        res.send('User is already registred!')
        return;
    }
    const id = users.length + 1;
    bcrypt.hash(password, 9, (err, hash) => {
        if (err) { next(err); return; }
        user = { id, name: username, password: hash };
        users.push(user);
        console.log(users);
        res.send('New user is added!')
    })

})
app.listen(8080, () => {
    console.log('Server is running on port 8080')
})