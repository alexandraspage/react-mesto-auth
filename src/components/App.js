import React from 'react';
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

function App() {

  const [isEditProfilePopupOpen, setEditProfilePopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setEditAvatarPopupOpen] = React.useState(false);
  const [cards, setCards] = React.useState([]);

  const [selectedCard, setSelectedCard] = React.useState(null);

  const [currentUser, setCurrentUser] = React.useState({});

  React.useEffect(() => {

    api.getInfo()
      .then((data) => {

        setCurrentUser(data);

      })
      .catch((err) => { console.log(err) })
  },[])

  React.useEffect(() => {
    api.getAllCards()
      .then((data) => {
        setCards(data)
      })
      .catch((err) => { console.log(err) })
  },[])

  function handleEditProfileClick() {
    setEditProfilePopupOpen(true);
  }
  function handleAddPlaceClick() {
    setAddPlacePopupOpen(true);
  }
  function handleEditAvatarClick() {
    setEditAvatarPopupOpen(true);
  }

  function closeAllPopups() {
    setEditAvatarPopupOpen(false);
    setEditProfilePopupOpen(false);
    setAddPlacePopupOpen(false);
    setSelectedCard(null);
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
    api.changeAvatar({ avatar })
      .then((data) => {
        setCurrentUser(data.avatar);
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

  return (
    <>
      <CurrentUserContext.Provider value={currentUser}>
        <Header />
        <Main
          cards={cards}
          onEditProfile={handleEditProfileClick}
          onAddPlace={handleAddPlaceClick}
          onEditAvatar={handleEditAvatarClick}
          onCardClick={handleCardClick}
          onCardLike={handleCardLike}
          onCardDelete={handleCardDelete}

        />
        <Footer />
        <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />
        <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onCreateCard={handleAddPlaceSubmit} />
        <ImagePopup card={selectedCard} onClosePopup={closeAllPopups}></ImagePopup>
        <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
        <PopupWithForm title="Вы уверены?" name="confirm" buttonText="Да" />
      </CurrentUserContext.Provider>
    </>
  );
}

export default App;
