// React-related
import React from 'react'

// Antd
import { Layout } from 'antd'
const { Header, Content, Footer, Sider } = Layout

class ContentLayout extends React.Component {
    render() {
        const { sider, content, contentClass, className, style } = this.props
        return (
            <Layout className={className} style={style}>
                <Sider style={{ width: "300px" }}>
                    {sider}
                </Sider>

                <Layout>
                    <Content className={contentClass}>
                        {content}
                    </Content>
                </Layout>
            </Layout>
        )
    }
}


ContentLayout.propTypes = {}

export default ContentLayout