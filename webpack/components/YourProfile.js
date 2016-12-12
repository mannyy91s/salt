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
    width                 : '800px',
    height                : '800px',
    // overflow              : 'scroll',
    transform             : 'translate(-50%, -50%)'
  }
}

class YourProfile extends React.Component{
    constructor(props) {
        super(props)
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.afterOpenModal = this.afterOpenModal.bind(this)
        this.sendId = this.sendId.bind(this)
        // this.friendsList = this.friendsList.bind(this)
        this.state = {
            myReviews: [],
            modalIsOpen: false,
            modalCurrentReview: undefined,
            friends: []
        }
    }
    componentWillMount(){
        Modal.setAppElement('#app');
        fetch('/api/profile?id=' + sessionStorage.getItem('id'))
        .then(response => response.json())
        .then(response => this.setState({
            myReviews: response.user.reviews
        }))
    }
    componentDidMount(){
      fetch('/api/friends/all?' + 'user_token=' + sessionStorage.getItem('token') + '&user_email=' + sessionStorage.getItem('email'))
      .then(response => response.json())
      // .then(this.friendsList)
      .then(response => this.setState({
        friends: response.users
      }))
      // .then(response => {
      //   console.log(response)
      // })
    }
    sendId(friend, target){
      let sentFriends = this.state.sentFriends
      target.disabled = true

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
    render(){
      var eachFriend = {
        boxShadow: '5px 5px 5px lightgrey',
        background: 'rgba(220, 220, 221, 1)',
        padding: 10,
        margin: 10
      }
      console.log(this.state.myReviews)
      var recFriends = this.state.friends.map((friend, i) => {
        return          <div style={eachFriend} className="col-sm-3" key={i}>
                              <img height="200"  width="200" className="img-rounded" src={friend.image} alt="" />
                              <h4 className="text-center">{friend.name}</h4>
                              <div className="text-center">
                                  <button className="btn btn-info" onClick={(e) => this.sendId(friend, e.target)}>Recommend</button>
                              </div>
                        </div>
      })
        var displayMyReviews = this.state.myReviews.map((review, i) => {
            return <div className="col-sm-12 home-middle-middle-myreview" key={i}>
                        <div className="row">
                            <div className="col-sm-12">
                              <Link to={'/readreview?place_id=' + review.place_id}>
                              <h3 className="text-center">{review.venue_name}</h3>
                              </Link>
                                <img  className="img-rounded" src={review.image} alt="" />
                                <p className="text-center">{moment(review.created_at).fromNow()}</p>
                            </div>
                            <div className="col-sm-12">
                                <p>Dish: {review.dish}</p>
                                Rating: <ReactStars count={review.rating} edit={false} color1={'#Eb8a3e'}/>
                                <p>website: <a href={review.website}>Link to website</a></p>
                                <h5>Review: <br/>{review.body}</h5>
                              </div>
                              <div className="col-sm-12 text-center">
                                <button className="btn btn-info" onClick={() => this.openModal(review)}>Recommend</button>
                                <Modal
                                  isOpen={this.state.modalIsOpen}
                                  onAfterOpen={this.afterOpenModal}
                                  onRequestClose={this.closeModal}
                                  style={customStyles}
                                  contentLabel="Recommend Friends">
                                  <div className="text-right">
                                    <button onClick={this.closeModal}><i className="fa fa-times" aria-hidden="true"></i>
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
        return(
            <div>
                <Menu />
                <Header />
                <div className="row home-middle-section">
                  <LeftMenu  {...this.props}/>
                  <div className="col-sm-8 home-middle-middle">
                     {displayMyReviews}
                  </div>
                  <FriendSideBar />
              </div>
            </div>
        )
    }
}
export default YourProfile
