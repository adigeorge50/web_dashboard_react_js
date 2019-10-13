import React from 'react'
import PropTypes from 'prop-types'
import { instanceOf } from 'prop-types'
import { compose } from 'redux'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

// Antd
import { Layout, Button } from 'antd'
const { Header, Footer, Sider, Content } = Layout
import { Collapse } from 'antd'
const Panel = Collapse.Panel
import { Pagination } from 'antd'
import { Spin, message } from 'antd'
import { Tooltip } from 'antd'

// Networking
import axios from 'axios'
import API_URLS from '../../_data/api_urls'

// Drag & Drop
import interact from 'interactjs'
import ICONS_STUDENT_NAME from '../../img/CreateForm/student_name.svg'

var cumulativeOffset = function(element) {
    var top = 0, left = 0
    do {
        top += element.offsetTop  || 0
        left += element.offsetLeft || 0
        element = element.offsetParent
    } while(element)

    return {
        top: top,
        left: left
    }
}

function offset(el) {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function getFieldData(el) {
    return {
        "pageNumber": parseInt(el.parentNode.id.replace('contentEl-', '')),
        "typeId": parseInt(el.getAttribute('data-fieldtype-id')),
        // "label": "string",
        "x": parseFloat(el.style.left.replace('px', '')),
        "y": parseFloat(el.style.top.replace('px', '')),
        "width": parseFloat(el.style.width.replace('px', '')) || el.offsetWidth,
        "height": parseFloat(el.style.height.replace('px', '')) || el.offsetHeight
    }
}

function getWidthAndHeight(el) {
    return {
        width: el.offsetWidth || parseFloat(el.style.width.replace("px", "")),
        height: el.offsetHeight || parseFloat(el.style.height.replace("px", ""))
    }
}

let fieldId = 0

class Step3 extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            formFieldTypes: {},
            ungroupedFormFieldTypes: {},
            fieldTypesLoading: true,
            page: 0,
            existingFields: {},
            zoomLevel: 1
        }
    }

    _removeExistingTile(e) {
        e.preventDefault()

        const removeButton = e.target
            , thumbToRemove = removeButton.parentNode

        this._removeFieldInFormData(thumbToRemove, true)
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
        if (zoomIn && currentWidth < 250) {
            contentEl.style.width = currentWidth * 1.3 + "%"
        } else if (!zoomIn && currentWidth > 100) {
            contentEl.style.width = (currentWidth / 1.3) + "%"
        }

        let newZoomLevel = this.state.zoomLevel
        const zoomRatio = 1.3
        if (zoomIn && currentWidth < 250 || !zoomIn && currentWidth > 100) {
            if (zoomIn) {
                newZoomLevel = (newZoomLevel * zoomRatio).toFixed(3)
            } else {
                newZoomLevel = (newZoomLevel / zoomRatio).toFixed(3)
            }

            this.setState({
                ...this.state,
                zoomLevel: newZoomLevel
            })
        }
    }

    render() {
        const { formData, fieldTypes, editMode } = this.props
            , { formFieldTypes, fieldTypesLoading, page, existingFields } = this.state

        if (fieldTypes) {
            return (
                <div id="dragndrop" style={{ minHeight: '573px' }}>
                    <div id="gallery" ref={(galleryEl) => this._galleryEl = galleryEl}>
                        <div
                            ref={(resizeWrapper) => this._resizeWrapper = resizeWrapper}
                        >
                            <div className="resize-container stage" ref={(stageEl) => this._stageEl = stageEl}>
                                {!formData.showedDragInstruction && <div id="drag-help"></div>}

                                <Layout>
                                    <Sider style={{ background: "transparent", position: "relative", zIndex: "1" }}>
                                        {!fieldTypesLoading &&
                                        <div ref={(accordion) => this._accordion = accordion}>
                                            <Collapse accordion defaultActiveKey={['field-group-0']}>
                                                {Object.keys(formFieldTypes).map((fieldGroupName, index) =>
                                                    <Panel header={fieldGroupName.charAt(0).toUpperCase() + fieldGroupName.slice(1)} key={`field-group-${index}`} className="thumbnails">
                                                        {formFieldTypes[fieldGroupName].map((fieldType, i) =>
                                                            <Tooltip placement="right" key={`field-tooltip-${i}`} title={fieldType.description} trigger="hover" mouseEnterDelay={1}>
                                                                <div className="tile-wrapper" key={`tile-${fieldGroupName}-${i}`}>
                                                                    <div
                                                                        className="tile thumbnail"
                                                                        data-fieldtype-id={fieldType.id}
                                                                    >
                                                                        <img src={fieldType.imageUrl} alt="" />
                                                                        <span>{fieldType.name}</span>

                                                                        <Button type="primary" shape="circle" icon="close" />
                                                                    </div>
                                                                </div>
                                                            </Tooltip>
                                                        )}
                                                    </Panel>
                                                )}
                                            </Collapse>
                                        </div>
                                        }

                                        {fieldTypesLoading &&
                                        <Spin style={{ display: 'block', margin: 'auto' }} />
                                        }
                                    </Sider>
                                    
                                    <Layout>
                                        <Content>
                                            {formData.pages.map((pageObj, index) =>
                                                <div className="resize-wrapper" key={`page-${index}`} style={{ display: page === index ? '' : 'none'  }}>
                                                    <div id={`contentEl-${index}`} className="resize-content">
                                                        <img
                                                            className="bg"
                                                            src={pageObj.url ? pageObj.url : `data:image/png;base64,${pageObj.base64Image}`}
                                                            id={`bgImageEl-${index}`}
                                                            onDragStart={(e) => {
                                                                if (e.preventDefault) e.preventDefault()
                                                                e.returnValue = false

                                                                return false
                                                            }}
                                                        />

                                                        {Object.keys(existingFields)
                                                        .filter(fieldKey => existingFields[fieldKey].pageNumber === page)
                                                        .map((fieldKey, i) => {
                                                                const field = existingFields[fieldKey]
                                                                    , fieldType = fieldTypes.find(fieldType => fieldType.id == field.typeId)
                                                                    return (
                                                                        <div
                                                                        className="tile thumbnail-on"
                                                                        style={{
                                                                            left: `${field.x}%`,
                                                                            top: `${field.y}%`,
                                                                            width: `${field.width}%`,
                                                                            height: `${field.height}%`
                                                                        }}
                                                                        key={`existing-field-${field.id}`}
                                                                        data-field-id={field.id}
                                                                        data-fieldtype-id={field.typeId}
                                                                        >
                                                                        <img src={fieldType.imageUrl} style={{ verticalAlign: fieldType.custom ? 'top' : undefined }} />

                                                                        {!fieldType.custom && <span>{fieldType.name}</span>}
                                                                        {fieldType.custom &&
                                                                             <textarea
                                                                                className="ant-input"
                                                                                placeholder={`${fieldType.name} title`}
                                                                                onChange={e => this._fieldChangeHander(e, fieldKey)}
                                                                                value={field.label}
                                                                            >
                                                                            </textarea>
                                                                        }

                                                                        <Button type="primary" shape="circle" icon="close" onClick={this._removeExistingTile.bind(this)} />
                                                                    </div>
                                                                )
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="drag-controls">
                                                <Pagination
                                                    style={{ textAlign: 'center', marginTop: '15px' }}
                                                    simple defaultCurrent={1} total={formData.pages.length * 10}
                                                    onChange={this._handlePageUpdate.bind(this)}
                                                />

                                                <div className="zoom">
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
                                        </Content>
                                    </Layout>
                                </Layout>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <Spin style={{ display: 'block', margin: 'auto' }} />
            )
        }
    }

    componentDidMount() {
        const { formData, _handleFormChange } = this.props
        if (formData.fields)
            this.setState({
                ...this.state,
                existingFields: formData.fields.map((field) => {
                    if (!field["id"]) field["id"] = fieldId++

                    return field
                })
            })


        // Initiate drag & drop configs
        window.dragMoveListener = dragMoveListener
        this._dragger()

        // Get form field types
        axios.get(API_URLS.formFieldType.get, {
            headers: {
                "Authorization": `Bearer ${this.props.auth.authToken}`
            }
        })
        .then(function (response) {
            const formFieldTypes = response.data
                , filteredFieldTypes = {}
            this.props._handleFieldTypes(formFieldTypes)
            formFieldTypes.map(formFieldType => {
                let key = filteredFieldTypes[formFieldType.grouping]
                if (key) {
                    key.push(formFieldType)
                } else {
                    filteredFieldTypes[formFieldType.grouping] = [formFieldType]
                }
            })


            // Remove drag & drop instruction animation
            if (!formData.showedDragInstruction) {
                setTimeout(() => {
                    _handleFormChange('showedDragInstruction', true)
                }, 7500)
            }

            this.setState({
                ...this.state,
                formFieldTypes: filteredFieldTypes,
                ungroupedFormFieldTypes: formFieldTypes,
                fieldTypesLoading: false
            })
        }.bind(this))
        .catch(function (error) {
            console.log(error)

            this.setState({
                fieldTypesLoading: false
            })

            message.error("Error retrieving field types!")
        }.bind(this))
    }

    _addFieldToFormData(el, label) {
        const { formData, _handleFormChange } = this.props
        , oldFields = formData.fields
        , fieldId = el.getAttribute('data-field-id')
        , fieldOldIndex = oldFields.findIndex(field => field.id == fieldId)
        const newField = {
            ...getFieldData(el),
            id: fieldId
        }
        if (label) {
            newField.label = label;
        }else {
            if(fieldOldIndex > -1){
                newField.label = oldFields[fieldOldIndex].label
            }
        }
        
        if (fieldOldIndex > -1) {
            oldFields[fieldOldIndex] = newField	
       } else {
            oldFields.push(newField)
       }
        _handleFormChange("fields", oldFields)
    }

    _updateFieldInFormData(el, label) {
        this._addFieldToFormData(el, label)
    }

    _removeFieldInFormData(el, updateExisting) {
        const { formData, _handleFormChange } = this.props
        let fields = formData.fields
        const indexToDelete = fields.map((field) => parseInt(field.id)).indexOf(parseInt(el.getAttribute("data-field-id")))

        if (fields.length === 1) fields = []
        else fields.splice(indexToDelete, 1)

        _handleFormChange("fields", fields)
        if (updateExisting)
            this.setState({
                ...this.state,
                existingFields: fields
            })
    }

    _customFieldChangeHander = (e) => {
        this._updateFieldInFormData(e.target.parentNode, e.target.value)
    }

    _fieldChangeHander = (e, fieldKey) => {
        let updatedFields = this.state.existingFields.map((key, index) =>{
            if(index === Number(fieldKey)) key.label = e.target.value
            return key
        })

        this.setState({
            ...this.state,
            existingFields: updatedFields,
        })
    }
    _dragger() {
        interact('#gallery .thumbnail')
            .draggable({
                onstart: function (event) {
                    const thumb = event.target
                    thumb.classList.add('dragging')
                }.bind(this),
                onmove: function (event) {
                    const thumb = event.target
                        , x = (thumb.dataset.dragX|0) + event.dx
                        , y = (thumb.dataset.dragY|0) + event.dy

                    thumb.style.webkitTransform = thumb.style.transform = 'translate(' + x + 'px,' + y + 'px)'

                    thumb.dataset.dragX = x
                    thumb.dataset.dragY = y

                    const thumbOffset = offset(thumb)
                            , contentEl = document.getElementById(`contentEl-${this.state.page}`)
                            , bgImageEl = document.getElementById(`bgImageEl-${this.state.page}`)
                            , contentOffset = offset(contentEl)
                            , topOffset = thumbOffset.top - contentOffset.top
                            , leftOffset = thumbOffset.left - contentOffset.left

                    if (topOffset >= 0 && leftOffset >= 0) {
                        thumb.style.width = 250 * this.state.zoomLevel + "px"
                        thumb.style.height = 38 * this.state.zoomLevel + "px"
                    } else {
                        thumb.style.width = "195.2px"
                        thumb.style.height = "38px"
                    }
                }.bind(this),
                onend: function (event) {
                    const thumb = event.target
                    // if the drag was snapped to the stage
                    if (event.dropzone) {
                        console.log("IN DROPZONE")

                        const thumbClone = thumb.cloneNode(true)
                        thumbClone.classList.remove('thumbnail')
                        thumbClone.classList.add('thumbnail-on')
                        thumbClone.style.webkitTransform = thumbClone.style.transform = ''
                        thumbClone.dataset.dragX = 0
                        thumbClone.dataset.dragY = 0

                        const thumbOffset = offset(thumb)
                            , contentEl = document.getElementById(`contentEl-${this.state.page}`)
                            , bgImageEl = document.getElementById(`bgImageEl-${this.state.page}`)
                            , contentOffset = offset(contentEl)
                            , topOffset = thumbOffset.top - contentOffset.top
                            , leftOffset = thumbOffset.left - contentOffset.left
                            , thumbSize = getWidthAndHeight(thumb)
                            , contentElSize = getWidthAndHeight(contentEl)
                        if (topOffset >= 0 && leftOffset >= 0 && (topOffset + thumbSize.height <= contentElSize.height) && (leftOffset + thumbSize.width <= contentElSize.width)) {
                            thumbClone.style.top = ((thumbOffset.top - contentOffset.top) / bgImageEl.offsetHeight * 100) + "%"
                            thumbClone.style.left = ((thumbOffset.left - contentOffset.left) / bgImageEl.offsetWidth * 100) + "%"
                            thumbClone.style.width = ((250 * this.state.zoomLevel) / bgImageEl.offsetWidth * 100) + "%"
                            thumbClone.style.height = ((38 * this.state.zoomLevel) / bgImageEl.offsetHeight * 100) + "%"
                            thumbClone.setAttribute('data-field-id', fieldId++)

                            // Custom fields
                            const fieldTypeId = thumb.getAttribute('data-fieldtype-id')
                                , { ungroupedFormFieldTypes } = this.state
                                , tileFieldType = ungroupedFormFieldTypes.find(fieldType => fieldType.id == fieldTypeId)

                            if (tileFieldType.custom) {
                                console.log("CUSTOM", tileFieldType)

                                thumbClone.querySelector('img').style.verticalAlign = "top"

                                const thumbText = thumbClone.querySelector('span')
                                thumbText.parentNode.removeChild(thumbText)

                                const thumbInput = document.createElement('textarea')
                                thumbInput.classList.add('ant-input', 'editable-text-area')
                                thumbInput.placeholder = `${tileFieldType.name} title`

                                // Bind change events
                                if (thumbInput.addEventListener) {
                                    thumbInput.addEventListener('input', this._customFieldChangeHander, false)
                                } else if (thumbInput.attachEvent) {
                                    thumbInput.attachEvent('onpropertychange', this._customFieldChangeHander)
                                }

                                thumbClone.appendChild(thumbInput)
                            }

                            // Remove Button
                            const newThumb = contentEl.appendChild(thumbClone)
                                , removeButton = newThumb.querySelector("button")

                            removeButton.addEventListener("click", function(e){
                                e.preventDefault()

                                console.log("CLICK TO REMOVE", e.target.parentNode)

                                const thumbToRemove = removeButton.parentNode
                                this._removeFieldInFormData(thumbToRemove, false)
                                thumbToRemove.parentNode.removeChild(thumbToRemove)
                            }.bind(this))
                            this._addFieldToFormData(thumbClone)
                        }

                        thumb.style.webkitTransform = thumb.style.transform = ''
                        thumb.style.width = "195.2px"
                        thumb.style.height = "38px"
                        thumb.dataset.dragX = 0
                        thumb.dataset.dragY = 0
                    }
                    else {
                        console.log("OUTSIDE OF DROPZONE")
                        thumb.style.webkitTransform = thumb.style.transform = ''

                        thumb.dataset.dragX = 0
                        thumb.dataset.dragY = 0
                    }

                    thumb.classList.remove('dragging')
                }.bind(this)
            })
            .origin(this._galleryEl)

        interact('#gallery .stage')
            .dropzone({
                accept: ' #gallery .thumbnail',
                // overlap: 1,
            })

        interact('#gallery .thumbnail-on')
            .draggable({
                onmove: window.dragMoveListener,
                onend: function(event) {
                    const thumb = event.target
                        , thumbOffset = offset(thumb)
                        , contentEl = document.getElementById(`contentEl-${this.state.page}`)
                        , bgImageEl = document.getElementById(`bgImageEl-${this.state.page}`)
                        , contentOffset = offset(contentEl)
                        , topOffset = thumbOffset.top - contentOffset.top
                        , leftOffset = thumbOffset.left - contentOffset.left

                        thumb.style.top = ((thumbOffset.top - contentOffset.top) / bgImageEl.offsetHeight * 100) + "%"
                        thumb.style.left = ((thumbOffset.left - contentOffset.left) / bgImageEl.offsetWidth * 100) + "%"

                        thumb.style.webkitTransform = thumb.style.transform = ''
                        thumb.setAttribute('data-x', 0)
                        thumb.setAttribute('data-y', 0)

                        this._updateFieldInFormData(thumb)
                }.bind(this),
                restrict: {
                    restriction: 'parent',
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                },
            })
            .resizable({
                // resize from all edges and corners
                edges: { left: false, right: true, bottom: true, top: false },

                // keep the edges inside the parent
                restrictEdges: {
                    outer: 'parent',
                    endOnly: true,
                },

                // minimum size
                restrictSize: {
                    min: { width: 20, height: 20 },
                },

                inertia: false,
            })
            .on('resizemove', function (event) {
                var target = event.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0),
                    y = (parseFloat(target.getAttribute('data-y')) || 0);

                const bgImageEl = document.getElementById(`bgImageEl-${this.state.page}`)
                // update the element's style
                target.style.width = (event.rect.width / bgImageEl.offsetWidth * 100) + "%"
                target.style.height = (event.rect.height / bgImageEl.offsetHeight * 100) + "%"

                // translate when resizing from top or left edges
                x += event.deltaRect.left;
                y += event.deltaRect.top;

                target.style.webkitTransform = target.style.transform =
                    'translate(' + x + 'px,' + y + 'px)';

                target.setAttribute('data-x', x)
                target.setAttribute('data-y', y)
            }.bind(this))
            .on('resizeend', function(event) {
                var thumb = event.target

                this._updateFieldInFormData(thumb)
            }.bind(this))
    }
}

function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}


Step3.propTypes = {}

export default
    compose(
        connect(
            (state) => ({
                auth: state.auth,
                localization: state.localization,
            }),
            // mapDispatchToProps
        )
    )(Step3)
