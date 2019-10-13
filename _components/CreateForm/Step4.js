import React from 'react'
import PropTypes from 'prop-types'
import { instanceOf } from 'prop-types'
import { compose } from 'redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// Antd
import { Icon, Button } from 'antd'
import { Layout } from 'antd'
const { Header, Footer, Sider, Content } = Layout
import { Pagination } from 'antd'
import { message } from 'antd'
import { Spin } from 'antd'

// Networking
import axios from 'axios'
import API_URLS from '../../_data/api_urls'

class Step4 extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            page: 0,
            zoomLevel: 1,
            isLoading: true
        }
    }

    componentDidMount() {
        const { formData } = this.props
        const fieldsArray = formData.fields.map(fieldObj => {
            return {
                ...fieldObj,
                x: parseInt(fieldObj.x),
                y: parseInt(fieldObj.y),
                width: parseInt(fieldObj.width),
                height: parseInt(fieldObj.height)
            }
        })

        axios.post(API_URLS.form.preview, {...formData, fields: fieldsArray}, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(({data}) => {
            const previewFields = data.previewFields.map(previewField => {
                const matchedElement = this.props.fieldTypes.find((fieldType) => previewField.typeId === fieldType.id);
                const {imageUrl} = matchedElement;
                return {...previewField, imageUrl};
            });
            this.setState({
                previewFields,
                isLoading: false
            })
        })
        .catch((error) => {
            console.log(error)

            this._toggleLoading()

            message.error("Failed retrieving preview values!")
        });
    }

    _toggleLoading() {
        this.setState({
            ...this.state,
            isLoading: false
        })
    }

    _handlePageUpdate(page, pageSize) {
        this.setState({
            ...this.state,
            page: page - 1
        })
    }

    _handleZoom(zoomIn) {
        const { page } = this.state
            , contentEl = document.getElementById(`contentEl-${page}`)
            , currentWidth = parseInt(contentEl.style.width.replace("%", "") || 100)

        if (zoomIn && currentWidth < 250 || !zoomIn && currentWidth > 100) {
            if (zoomIn && currentWidth < 250) {
                contentEl.style.width = currentWidth * 1.3 + "%"
            } else if (!zoomIn && currentWidth > 100) {
                contentEl.style.width = (currentWidth / 1.3) + "%"
            }

            Array.prototype.slice.call(contentEl.querySelectorAll("div.preview-field"))
                .map(el => {
                    const elWidth = parseFloat(el.style.width.replace('px', '')) || el.offsetWidth
                        , elHeight = parseFloat(el.style.height.replace('px', '')) || el.offsetHeight
                        , elFontSize = parseFloat(el.style.fontSize.replace('px', '') || 16)
                    let newZoomLevel = this.state.zoomLevel
                        , newFontSize
                    if (zoomIn) {
                        newFontSize = (elFontSize * 1.3)
                        newZoomLevel *= 1.3
                    } else {
                        newFontSize = (elFontSize / 1.3)
                        newZoomLevel /= 1.3
                    }

                    el.style.fontSize = `${newFontSize}px`
                    el.querySelector('div').style.lineHeight = (newFontSize * 0.75) + "px"
                })
        }

    }

    render() {
        const { formData, fieldTypes, editMode } = this.props
            , { page, isLoading, previewFields } = this.state
        if (!isLoading)
            return (
                <Layout>
                    <Sider style={{ background: "transparent", position: "relative", zIndex: "1" }}>

                    </Sider>

                    <Layout>
                        <Content style={{ height: '500px', overflowY: 'scroll' }}>
                            {formData.pages.map((pageObj, index) =>
                            <div className="form-preview" id={`contentEl-${index}`} key={`page-${index}`} style={{ display: page === index ? '' : 'none'  }}>
                                <img
                                    className="bg"
                                    src={pageObj.url ? pageObj.url : `data:image/png;base64,${pageObj.base64Image}`}
                                    id={`bgImageEl-${index}`}
                                />

                                {Object.keys(formData.fields)
                                .filter(fieldKey => formData.fields[fieldKey].pageNumber === page)
                                .map((fieldKey, i) => {
                                    const fieldItem = formData.fields[fieldKey]
                                        , fieldType = fieldTypes.find(fieldType => fieldType.id == fieldItem.typeId)

                                    let previewField
                                    let previewText
                                    if (previewFields) {
                                        if (fieldType.custom === true) {
                                            previewText = fieldItem.label
                                        } else {
                                            previewField = previewFields.find(pField => pField.typeId == fieldType.id)

                                            previewText = previewField.value
                                        }
                                    } else {
                                        previewText = fieldType.name
                                    }
                                    const background = fieldItem.typeId === 25 ? 'white' : 'transparent'
                                    return (
                                        <div
                                            className="preview-field"
                                            style={{
                                                top: `${fieldItem.y}%`, left: `${fieldItem.x}%`,
                                                width: `${fieldItem.width}%`, height: `${fieldItem.height}%`,
                                                background
                                            }}
                                            key={`field-${i}`}
                                        >
                                            {(fieldItem.typeId === 26 || fieldItem.typeId === 27) ? 
                                            (<div style={{height: '100%', display: 'flex'}}>
                                                <img style={{height: '100%'}}src={previewFields.find(prewField => fieldItem.typeId === prewField.typeId).imageUrl} />
                                                <div style={{textAlign: 'left', fontWeight: 'bold'}}>
                                                    {previewText}
                                                </div>
                                            </div>) :
                                            (<div className="preview-field-text">
                                                {previewText}
                                            </div>)
                                            }
                                        </div>
                                    )
                                }
                                )}
                            </div>
                            )}
                        </Content>

                        <div className="drag-controls">
                            <Pagination
                                style={{ textAlign: 'center', marginTop: '15px' }}
                                simple defaultCurrent={1} total={formData.pages.length * 10}
                                onChange={this._handlePageUpdate.bind(this)}
                            />

                            <div className="zoom" style={{ top: '15px' }}>
                                <Button
                                    type="primary" shape="circle" icon="plus"
                                    onClick={this._handleZoom.bind(this, true)}
                                />

                                <Button
                                    type="primary" shape="circle" icon="minus" className="minus"
                                    onClick={this._handleZoom.bind(this, false)}
                                />
                            </div>
                        </div>
                    </Layout>
                </Layout>
            )
        else
            return (
                <Spin style={{ display: 'block', margin: 'auto' }} />
            )
    }
}

Step4.propTypes = {}

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
                localization: state.localization,
            }),
            // mapDispatchToProps
        )
    )(Step4)
