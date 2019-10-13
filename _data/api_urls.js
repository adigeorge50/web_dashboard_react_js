const BASE_URL = IS_PROD ? 'https://atschooltoday-dev-api.azurewebsites.net/api/' : '/api/'

const accounts = {
    signIn: `${BASE_URL}Account/login`,
    facebookLogin: `${BASE_URL}Account/login/facebook`,
    resetPassword: `${BASE_URL}Account/resetpassword`,
    forgotPassword: `${BASE_URL}Account/forgotpassword`,
    register: `${BASE_URL}Account/register`,
    registerParent: `${BASE_URL}Account/registerparent`,
    confirmEmail: `${BASE_URL}Account/confirmemail`,
    setParentPassword: `${BASE_URL}Account/setparrentpassword`,
}

const student = {
    get: `${BASE_URL}Student`,
    put: `${BASE_URL}Classroom/StudentUpdate`
}

const engagements = {
    get: `${BASE_URL}Engagement/`
}

const classroom = {
    get: `${BASE_URL}Classroom`,
    update: `${BASE_URL}Classroom`,
    create: `${BASE_URL}Classroom`,
    delete: `${BASE_URL}Classroom`,
    deleteStudent: (classroomID, studentID) => `${BASE_URL}Classroom/${classroomID}/RecoverableRemovestudent/${studentID}`
}

const school = {
    get: `${BASE_URL}School`,
    create: `${BASE_URL}School`,
    delete: `${BASE_URL}School`
}

const depositMethod = {
    get: `${BASE_URL}depositMethod`
}

const form = {
    get: `${BASE_URL}Form`,
    delete: `${BASE_URL}Form`,
    submit: `${BASE_URL}Form`,
    update: `${BASE_URL}Form`,
    preview: `${BASE_URL}Form/Preview`,
    splitPDF: `${BASE_URL}Form/SplitPdf`,
    download: `${BASE_URL}Form/Download`,
}

const studentForm = {
    delete: formID => `${BASE_URL}StudentForm/${formID}`
}

const formTemplate = {
    get: `${BASE_URL}FormTemplate`,
    save: `${BASE_URL}Form`
}

const formFieldType = {
    get: `${BASE_URL}FormFieldType`
}

const onBoarding = {
    get: classroomID => `${BASE_URL}Classroom/${classroomID}/onboarding`,
    submit: classroomID => `${BASE_URL}Classroom/${classroomID}/onboarding`
}

const classroomInvitation = {
    get: `${BASE_URL}Parents/ClassroomInvitation`,
    details: invitationID => `${BASE_URL}Parents/ClassroomInvitation/${invitationID}`,
    put: invitationID => `${BASE_URL}ClassroomInvitation/${invitationID}`,
    delete: (invitationID, classroomId) => `${BASE_URL}Classroom/${classroomId}/RecoverableRemoveParent/${invitationID}`,
    accept: invitationID => `${BASE_URL}Parents/ClassroomInvitation/${invitationID}/accept`,
    emailExists: email => `${BASE_URL}Account/email/${email}`,
    register: invitationID => `${BASE_URL}Parents/ClassroomInvitation/${invitationID}/register`,
    resend: invitationID => `${BASE_URL}ClassroomInvitation/${invitationID}/resend`,
    getChild: `${BASE_URL}Parent/GetChildren`,
}

const googlePlaces = {
    autoComplete: (input) => `https://maps.googleapis.com/maps/api/place/autocomplete/xml?input=${input}&types=geocode&key=AIzaSyBPxHtY-9sp16UxrDDXAvto7ekK0XuiYmU`
}

const paymentAccount = {
    post: `${BASE_URL}PaymentAccount`
};

const teacherAccount = {
    get: `${BASE_URL}Teacher/me`,
    put: `${BASE_URL}Teacher/me`,
}

module.exports = {
    accounts,
    student,
    engagements,
    classroom,
    school,
    depositMethod,
    form,
    studentForm,
    formFieldType,
    formTemplate,
    onBoarding,
    classroomInvitation,
    googlePlaces,
    refer: `${BASE_URL}Refer`,
    paymentAccount,
    teacherAccount,
}
