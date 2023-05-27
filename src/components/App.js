import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import '../index.css';
import Header from './Header.js';
import Main from './Main.js'
import Footer from './Footer.js';
import PopupWithForm from './PopupWithForm';
import ImagePopup from './ImagePopup';
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import api from '../utils/Api';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import Login from './Login.js';
import Register from './Register.js';
import ProtectedRoute from './ProtectedRoute.js';
import * as auth from '../utils/auth.js';
import { InfoTooltip } from './InfoTooltip';


function App() {

  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = React.useState(false);
  const [cards, setCards] = React.useState([]);

  const [selectedCard, setSelectedCard] = React.useState(null);

  const [currentUser, setCurrentUser] = React.useState({});

  const [loggedIn, setLoggedIn] = React.useState(false);

  const [isSignedUp, setSignedUp] = React.useState(false);

  const [userEmail, setUserEmail] = React.useState('');

  const [isInfoPopupOpen, setInfoPopupOpen] = React.useState(false);

  const navigate = useNavigate();


  React.useEffect(() => {

    api.getInfo()
      .then((data) => {

        setCurrentUser(data);

      })
      .catch((err) => { console.log(err) })
  }, [])

  React.useEffect(() => {
    api.getAllCards()
      .then((data) => {
        setCards(data)
      })
      .catch((err) => { console.log(err) })
  }, [])

  function handleEditProfileClick() {
    setEditProfilePopupOpen(true);
  }
  function handleAddPlaceClick() {
    setAddPlacePopupOpen(true);
  }
  function handleEditAvatarClick() {
    setEditAvatarPopupOpen(true);
  }

  function handleInfoPopup() {
    setInfoPopupOpen(true);
  }

  function closeAllPopups() {
    setEditAvatarPopupOpen(false);
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setSelectedCard(null);
    setInfoPopupOpen(false);
  }

  function handleCardClick(card) {

    setSelectedCard(card);

  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    if (!isLiked) {
      api.putLike(card._id)
        .then((newCard) => {
          setCards(() =>
            cards.map((c) => c._id === card._id ? newCard : c))
        })
        .catch((err) => { console.log(err) })
    } else {
      api.deleteLike(card._id)
        .then((newCard) => {
          setCards(() =>
            cards.map((c) => c._id === card._id ? newCard : c))
        })
        .catch((err) => { console.log(err) })
    }

  }

  function handleCardDelete(card) {
    api.deleteCard(card._id)
      .then(() => {
        setCards((cards => cards.filter((c) => c._id !== card._id)))
      })
      .catch((err) => { console.log(err) })
  }

  function handleUpdateUser({ name, description }) {
    api.changeUserInfo({ name, description })
      .then((data) => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => { console.log(err) })

  }

  function handleUpdateAvatar({ avatar }) {
    console.log(avatar);

    api.changeAvatar({ avatar })
      .then((data) => {
        console.log(data);
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch((err) => { console.log(err) })

  }

  function handleAddPlaceSubmit({ name, link }) {
    api.addCard({ name, link })
      .then((newCard) => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => { console.log(err) })

  }

  function handleLoginSubmit({ email, password }) {
    auth.authorize(email, password)
      .then((data) => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          setLoggedIn(true);
          setUserEmail(email);
          navigate('/main', { replace: true });

        }

      })
      .catch((err) => { console.log(err) })
  }

  function handleRegisterSubmit({ email, password }) {

    auth.register(email, password)
      .then(() => {
        setSignedUp(true);
        navigate('/sign-in', { replace: true });
      })
      .catch((err) => {
        setSignedUp(false);
        console.log(err)
      })

    handleInfoPopup();
  }

  function tokenCheck() {
    const jwt = localStorage.getItem('token');
    if (jwt) {
      auth.getContent(jwt)
        .then((data) => {
          setLoggedIn(true);
          const user = data.data;
          setUserEmail(user.email);
          navigate('/main', { replace: true })
        })
        .catch((err) => { console.log(err) })
    }
  }

  React.useEffect(() => {
    tokenCheck();

  }, [])

  function signOut() {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setUserEmail('')
  }

  return (
    <>
      <CurrentUserContext.Provider value={currentUser}>
        <Header userEmail={userEmail} signOut={signOut} />
        <main className="content">
          <Routes>
            <Route path="/sign-up" element={<Register title="Регистрация" button="Зарегистрироваться" handleInfoPopup={handleInfoPopup} handleRegister={handleRegisterSubmit} />}></Route>
            <Route path="/sign-in" element={<Login title="Вход" button="Войти" handleLogin={handleLoginSubmit} />}></Route>
            <Route path="/main" element={<ProtectedRoute loggedIn={loggedIn} element={Main}

              cards={cards}
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onEditAvatar={handleEditAvatarClick}
              onCardClick={handleCardClick}
              onCardLike={handleCardLike}
              onCardDelete={handleCardDelete}

            />}
            >
            </Route>
          </Routes>
          <Footer />
        </main>
        <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />
        <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onCreateCard={handleAddPlaceSubmit} />
        <ImagePopup card={selectedCard} onClosePopup={closeAllPopups}></ImagePopup>
        <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
        <PopupWithForm title="Вы уверены?" name="confirm" buttonText="Да" />
        <InfoTooltip isOpen={isInfoPopupOpen} isSignedUp={isSignedUp} onClosePopup={closeAllPopups}></InfoTooltip>
      </CurrentUserContext.Provider>
    </>
  );
}

export default App;
