import React from 'react'
import { Link } from "react-router-dom"

// Antd
import { Icon, Button } from 'antd'

export default class Comp extends React.Component {
    render() {
        return (
            <div style={{ textAlign: "center", marginBottom: 20 }}>
                <h3 style={{ marginTop: 15 }}>Thank you!</h3>
                
                <Link to="/">
                    <Button
                        type="primary" size='large'
                    >
                        <Icon type="left" />
                        Go Back to Calendar
                    </Button>
                </Link>
            </div>
        )
    }
}
