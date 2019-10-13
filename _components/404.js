// React-related
import React from 'react'

import NotFound from '../img/not-found.svg'

class NotFoundComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
      if(this.props.match.path === '/classroominvitation/:invitationID') {
        this.props.signOut(`${this.props.match.url}${this.props.location.search}`);
      }
    }

    render() {
        return (
            <div className="container marginTop-30" style={{ textAlign: 'center', paddingTop: '30px' }}>
                <img src={NotFound} />

                <p style={{ margin: '15px 0 0 0', fontSize: 30, fontWeight: 700, color: '#333' }}>
                    That doesn't ring a bell!
                </p>

                <p>
                    The page you're looking for does not exist
                </p>
            </div>
        )
    }
}

export default NotFoundComponent
