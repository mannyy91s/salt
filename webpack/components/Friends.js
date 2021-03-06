import React from 'react'
import { Link } from 'react-router'
import Menu from './Menu'
import LeftMenu from './LeftMenu'
import Header from './Header'
import FriendSideBar from './FriendSideBar'
import Modal from 'react-modal'

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
    overflow              : 'scroll',
    transform             : 'translate(-50%, -50%)'
  }
}

class Friends extends React.Component {
    constructor(props){
        super(props)
        this.removeFriend = this.removeFriend.bind(this)
        this.emailsHandler = this.emailsHandler.bind(this)
        this.enter = this.enter.bind(this)
        this.clickHandler = this.clickHandler.bind(this)
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.inputHandler = this.inputHandler.bind(this)
        this.findFriend = this.findFriend.bind(this)
        this.enterHandler = this.enterHandler.bind(this)
        this.followAllFriends = this.followAllFriends.bind(this)
        this.followSingleFriend = this.followSingleFriend.bind(this)
        this.followClickHandler = this.followClickHandler.bind(this)
        this.state = {
            friends: [],
            id: '',
            email: '',
            modalIsOpen: false,
            name: '',
            searchFriends: []
          }
    }
    componentWillMount() {
    Modal.setAppElement('#app');
    }
    componentDidMount(){
        fetch('/api/friends/all?' + 'user_token=' + sessionStorage.getItem('token') + '&user_email=' + sessionStorage.getItem('email'))
        .then(response => response.json())
        .then(response => this.setState({
            friends: response.users
        }))
    }

    removeFriend(id){
        fetch('/api/unfollow?' + 'user_email=' + sessionStorage.getItem('email') + '&user_token=' + sessionStorage.getItem('token') + '&id=' + id , {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(response => {
          let friends = this.state.friends
          friends = friends.filter(friend => friend.id !== id)
          this.setState({friends: friends})
        })
    }
    enter(e){
        if(e.key === 'Enter'){
            this.inviteFriends(e)
            this.setState({
                email: ''
            })
        }
    }
    emailsHandler(e){
        this.setState({
            email: e.target.value
        })
    }
    clickHandler(){
        this.inviteFriends()
        this.setState({
          email: ''
        })
    }
    inviteFriends(e){
        if (this.state.email !== '') {
            fetch('/api/invite/friends', {
                body: JSON.stringify({
                    user_email: sessionStorage.getItem('email'),
                    user_token: sessionStorage.getItem('token'),
                    emails: this.state.email
                }),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                console.log(response)
                let statusCode = response.status
                return {json: response.json(), status: statusCode}
            })
            .then(response => {if(response.status >= 200 && response.status < 300){
              alert('Invite Sent')
            } else{
              alert('Please enter valid Email')
            }})
        }
    }
    openModal() {
      this.setState({modalIsOpen: true});
    }
    closeModal() {
      this.setState({modalIsOpen: false});
    }
    enterHandler(e){
      if(e.key === 'Enter'){
        this.findFriend(e)
      }
    }
    followClickHandler(){
      this.findFriend()
    }
    inputHandler(e){
      this.setState({
        name: e.target.value
      })
    }
    findFriend(e){
      fetch('/api/search/friends?user_email=' + sessionStorage.getItem('email') + '&user_token=' + sessionStorage.getItem('token') + '&name=' + this.state.name)
      .then(response => response.json())
      .then(response => this.setState({
        searchFriends: response.users
      }))
    }
    followAllFriends(){
        fetch('/api/facebook/follow?user_email=' + sessionStorage.getItem('email') + '&user_token=' + sessionStorage.getItem('token'))
        .then(response => response.json())
        .then(response => {
          let allFriends = response.users.filter(newFriend => {
            let shouldAddFriend = true
            if(this.state.friends){
              this.state.friends.forEach(friend => {
                if (friend.id === newFriend.id) {
                  shouldAddFriend = false
                }
              })
            }
            return shouldAddFriend
          })
          let friends = this.state.friends || []
          friends = friends.concat(allFriends)

          this.setState({
            friends: friends
          })
        })
    }
    followSingleFriend(search){
      fetch('/api/follow/friend', {
        body: JSON.stringify({
          user_email: sessionStorage.getItem('email'),
          user_token: sessionStorage.getItem('token'),
          id: search.id
        }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(response => {
        let friends = this.state.friends
        friends.push(response.user)
        this.setState({friends: friends})
      })
    }
    render(){
      var eachFriend = {
        boxShadow: '5px 5px 5px lightgrey',
        background: 'rgba(220, 220, 221, 1)',
        padding: 10,
        margin: 10
      }
        var lookupFriends = this.state.searchFriends.map((search, i) => {
          let isFriend = false
          if(this.state.friends){
            this.state.friends.forEach(friend => {
              isFriend = (isFriend || friend.id === search.id)
            })
          }

          return <div style={eachFriend} className="col-sm-3" key={i}>
                                <Link to={'/friendprofile/' + search.id}>
                                <img height="200"  width="200" className="img-responsive" src={search.image} alt="" />
                                <h4 className="text-center">{search.name}</h4>
                                </Link>
                                <div className="text-center">
                                    <button className="btn btn-info" onClick={() => this.followSingleFriend(search)} disabled={isFriend}>{isFriend?'Following':'Follow'}</button>
                                </div>
                          </div>
        })
        if(this.state.friends){
          var myFriends = this.state.friends.map((friend, i) =>{
          return     <div className="col-sm-3 home-middle-middle-friends" key={i}>
                        <Link to={'/friendprofile/' + friend.id} >
                        <img className="img-responsive" src={friend.image} alt="Friends Image" />
                        <h4 className="text-center">{friend.name}</h4>
                        <h5 className="text-center">Points: <span className="badge">{friend.reviews.length}0</span></h5>
                        </Link>
                        <div className="text-center">
                            <button className="btn btn-info" onClick={() => this.removeFriend(friend.id)}>Unfollow</button>
                        </div>
                      </div>
          })
        } else {
          var myFriends =   <div className="col-sm-6 no-friends">
                              <h1 className="text-center">Please add friends!</h1>
                            </div>
        }

        return(
          <div>
            <Header />
            <Menu />
            <div className="row">
              <div className="home-middle-section">
                <LeftMenu  {...this.props}/>
                <div className={window.location.href.indexOf('friends')?"col-sm-10 home-middle-middle":''}>
                  <div className="row post-review-header">
                    <h1 className="text-center">Friends</h1>
                  </div>
                  <div className="row">
                    <div className="col-sm-5 col-sm-offset-3 invite-section well">
                      <div className="input-group">
                        <input type="text" id="invite-input" className="form-control" placeholder="Enter friends email to invite them"   onChange={this.emailsHandler}  value={this.state.email} onKeyPress={this.enter}/>
                        <span className="input-group-btn">
                          <button className="btn my-button btn-md" id="invite-friend-button" onClick={this.clickHandler}>Invite</button>
                        </span>
                      </div>
                    </div>
                  </div>
                  <br/>
                  <div className="row">
                    <div className="col-sm-3 col-sm-offset-1  col-xs-3 text-right">
                      <button className="btn friends-button" onClick={this.openModal}><i className="fa fa-search" aria-hidden="true"></i> Friends Search</button>
                      <Modal
                        isOpen={this.state.modalIsOpen}
                        onAfterOpen={this.afterOpenModal}
                        onRequestClose={this.closeModal}
                        overlayClassName="YourProfile"
                        contentLabel="Example Modal">
                        <div className="text-right">
                          <button onClick={this.closeModal}><i className="fa fa-times" aria-hidden="true"></i>
                        </button>
                      </div>
                      <div className="col-sm-6 col-sm-offset-3 well">
                        <div className="input-group">
                          <input type="text" id="invite-input" className="form-control" placeholder="Search for friends"   onChange={this.inputHandler} value={this.state.input} onKeyPress={this.enterHandler}/>
                          <span className="input-group-btn">
                            <button className="btn my-button btn-md" id="invite-friend-button" onClick={this.followClickHandler}>Search</button>
                          </span>
                        </div>
                      </div>
                      <div className="row">
                        {lookupFriends}
                      </div>
                    </Modal>
                  </div>
                  <div className="col-sm-3 col-xs-3 col-xs-offset-3 text-left">
                    <button className="btn friends-button" onClick={this.followAllFriends}>Add All FB Friends</button>
                  </div>
                </div>
                <div className="row myfriends-list">
                  {myFriends}
                </div>
              </div>
              {window.location.href.indexOf('friends')?'':<div><FriendSideBar friends={this.state.friends} /></div>}
            </div>
          </div>
        </div>
        )
    }
}
export default Friends
