export const LoginLocator = {
    username: "//input[@name='username']",
    password: "//input[@name='password']",
    loginButton: "//button[contains(.,'Login')]",

    menu: (menuName: string) => 
        `//span[normalize-space()='${menuName}']`,

    dropdown_profile: "(//img[@alt='profile picture']/following::i[1])[1]",
    logout: "//img[@alt='profile picture']/following::a[contains(text(),'Logout')]"

}