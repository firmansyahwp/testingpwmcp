export const MyInfoLocator = {
    submenu: (submenuName: string) => 
        `//a[normalize-space()='${submenuName}']`,

    /*Required Fields*/
    firstName: "//input[@placeholder='First Name']", 
    middleName: "//input[@placeholder='Middle Name']",
    lastName: "//input[@placeholder='Last Name']",
    employeeID: "//label[normalize-space()='Employee Id']/following::input[1]",
    otherID: "//label[normalize-space()='Other Id']/following::input[1]",
    driverLicensed: `//label[normalize-space()="Driver's License Number"]/following::input[1]`,
    licensedExp: "//label[normalize-space()='License Expiry Date']/following::input[1]",
    
    dropdown_nationality: "(//label[normalize-space()='Nationality']/following::div[contains(@class,'oxd-select-text')])[1]",
    /*list_nationality: (nationality: string) =>
        `//div[contains(@class,'oxd-select-text-input') and normalize-space()='${nationality}']`,
    */
    dropdown_martialStatus: "(//label[normalize-space()='Marital Status']/following::div[contains(@class,'oxd-select-text')])[1]",
    /*
    list_maritalStatus: (maritalStatus: string) => 
        `//div[contains(@class,'oxd-select-text-input') and normalize-space()='${maritalStatus}']`,
    */
    birth: "//label[normalize-space()='Date of Birth']/following::input[1]",
    gender: (gender: string) => 
        `//label[normalize-space()='${gender}']`, 
    btnSave_Required: "(//button[@type='submit'])[1]",
    
    /*Custom Fields*/
    bloodType: (bloodType: string) =>
        `//div[normalize-space()='${bloodType}']`,
    testField: "//label[normalize-space()='Test_Field']/following::input[1]",
    btnSave_CustomFields: "(//button[@type='submit'])[2]",

    /*Attachment Fields*/
    add_Attachment: "//h6[normalize-space()='Attachments']/following::button[1]",
    file_Attachment: "//input[@type='file']",
    comment_Attachment: "//textarea",
    btnSave_Attachment: "(//button[@type='submit'])[3]"
}