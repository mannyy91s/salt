import React from 'react'
import { Link } from 'react-router'
import Menu from './Menu'
import LeftMenu from './LeftMenu'
import Header from './Header'
import FriendSideBar from './FriendSideBar'
import moment from 'moment'
import Modal from 'react-modal'
import ReactStars from 'react-stars'


const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    background            : '#E6EFF2',
    overflow              : 'scroll',
    transform             : 'translate(-50%, -50%)',
    }
}

class YourProfile extends React.Component{
    constructor(props) {
        super(props)
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.afterOpenModal = this.afterOpenModal.bind(this)
        this.sendId = this.sendId.bind(this)
        this.destroyReview = this.destroyReview.bind(this)
        this.state = {
            myReviews: [],
            modalIsOpen: false,
            modalCurrentReview: undefined,
            friends: [],
            name: '',
            image: '',
            badges: []
        }
    }
    componentWillMount(){
        Modal.setAppElement('#app');
        fetch('/api/profile?id=' + sessionStorage.getItem('id'))
        .then(response => response.json())
        .then(response => this.setState({
            myReviews: response.user.reviews,
            name: response.user.name,
            image: response.user.image,
            badges: response.user.badges
        }))

    }
    componentDidMount(){
      fetch('/api/friends/all?' + 'user_token=' + sessionStorage.getItem('token') + '&user_email=' + sessionStorage.getItem('email'))
      .then(response => response.json())
      .then(response => this.setState({
        friends: response.users
      }))
    }
    sendId(friend, target){
      let sentFriends = this.state.sentFriends
      target.disabled = true
      target.innerHTML = 'Sent'
      target.classList.add('btn-success')
      target.classList.remove('btn-info')

      fetch('/api/send/rec', {
              body: JSON.stringify({
                  user_email: sessionStorage.getItem('email'),
                  user_token: sessionStorage.getItem('token'),
                  review_id: this.state.modalCurrentReview.id,
                  friend_id: friend.id
              }),
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              }})
      .then(response => response.json())
  }
    openModal(review) {
      this.setState({modalIsOpen: true, modalCurrentReview: review});
    }
    closeModal() {
      this.setState({modalIsOpen: false});
    }
    afterOpenModal() {
    }
    destroyReview(review){
      fetch('/api/reviews/destroy' , {
        body: JSON.stringify({
          user_token: sessionStorage.getItem('token'),
          user_email: sessionStorage.getItem('email'),
          id: review.id
        }),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }})
      .then(response => response.json())
      .then(response => {
        let removeReview = this.state.myReviews
        removeReview = removeReview.filter((r) => r.id !== review.id )
        this.setState({
          myReviews: removeReview
        })
      })
    }
    render(){
      var eachFriend = {
        boxShadow: '5px 5px 5px lightgrey',
        background: 'rgba(220, 220, 221, 1)',
        padding: 10,
        margin: 10
      }
      var myBadges = this.state.badges.map((badge, i) => {
        return <h5 key={i}>{badge.description}</h5>
      })
      if(this.state.friends){
        var recFriends = this.state.friends.map((friend, i) => {
          return          <div style={eachFriend} className="col-xs-4 rec-modal-friends" key={i}>
                                <img src={friend.image} alt="" />
                                <h5 className="text-center">{friend.name}</h5>
                                <div className="text-center">
                                    <button className="btn btn-info btn-xs" onClick={(e) => this.sendId(friend, e.target)}>Recommend</button>
                                </div>
                          </div>
        })
      } else {
        var recFriends = <div className="col-sm-12">
          <div className="row">
            <div style={eachFriend} className="col-sm-11">
              <h4 className="text-center">You have no friends to recommend this review to.<br/>
                 Please add friends before using this feature!</h4>
            </div>
          </div>
        </div>
      }
        if(this.state.myReviews){
          var displayMyReviews = this.state.myReviews.map((review, i) => {
              return <div className="col-sm-3 home-middle-middle-myreview" key={i}>
                        <div className="row">
                            <div className="col-sm-12">
                              <p className="text-right delete-review"><i className="fa fa-times" aria-hidden="true" onClick={() => this.destroyReview(review)}></i></p>
                              <Link to={'/readreview?place_id=' + review.place_id}>
                              <h4 className="text-center">{review.venue_name}</h4>
                            </Link>
                            <img  className="img-responsive" src={review.image} alt="" />
                            <p className="text-center">{moment(review.created_at).fromNow()}</p>
                          </div>
                          <div className="col-sm-12">
                            <ReactStars count={review.rating} edit={false} color1={'#Eb8a3e'}/>
                            <p>Dish: {review.dish}</p>
                          </div>
                          <div className="col-sm-12">
                            <h5>Review: <br/>{review.body}</h5>
                          </div>
                          <div className="col-sm-12 text-center recommend-button-section">
                            <button className="btn btn-info" onClick={() => this.openModal(review)}>Recommend</button>
                            <Modal
                              isOpen={this.state.modalIsOpen}
                              onAfterOpen={this.afterOpenModal}
                              onRequestClose={this.closeModal}
                              contentLabel="Recommend Friends"
                              overlayClassName="YourProfile">
                              <div className="text-right">
                                <button onClick={this.closeModal}><i className="fa fa-times fa-2x" aria-hidden="true"></i>
                              </button>
                            </div>
                            <div className="row">
                              {recFriends}
                            </div>
                          </Modal>
                        </div>
                    </div>
                  </div>
                })
              }
              return(
                <div>
                  <Menu />
                  <Header />
                  <div className="row home-middle-section">
                    <LeftMenu  {...this.props}/>
                    <div className="col-sm-8 home-middle-middle">
                      <div className="row my-profile-background">
                        <div className="col-sm-12 text-center">
                          <h1 className="friend-profile-name">{this.state.name}</h1>
                          <h4>Points: <span className="badge">{this.state.myReviews.length}0</span></h4>
                          <h4>Achievements:</h4>
                          {myBadges}
                        </div>
                      </div>
                      <div className="row my-review-row">
                        {displayMyReviews}
                      </div>
                    </div>
                    <FriendSideBar />
                  </div>
          </div>
        )
    }
}
export default YourProfile
