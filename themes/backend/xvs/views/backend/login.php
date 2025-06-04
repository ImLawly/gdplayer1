<?php
session_write_close();
use \GDPlayer\{Config, HTML, Login, Mailer, Security, Views};
use \GDPlayer\Model\User;

$login = new Login();
$mailer = new Mailer();
$security = new Security();
$users = User::getInstance();

$sitename = sitename();
$loginURL = BACKEND_BASEURL . 'login/';
$dashboardURL = BACKEND_BASEURL . 'dashboard/';

if (isset($_GET['logout']) && validateBoolean($_GET['logout'])) {
    $logout = $login->logout();
    if ($logout) {
        createAlert('success', 'You have successfully logged out', $loginURL);
    } else {
        createAlert('danger', 'You cannot log out! Try again later', $dashboardURL);
    }
} elseif (isset($_GET['username']) || isset($_GET['password'])) {
    redirectTo($loginURL);
} elseif (currentUser()) {
    redirectTo($dashboardURL);
} elseif (isset($_POST['submit'])) {
    $username = sanitizeHtml($_POST['username']);
    $password = sanitizeHtml($_POST['password']);
    $remember = validateBoolean($_POST['remember'] ?? 0);
    $isValid = recaptchaValidation($_POST['g-recaptcha-response'] ?? '');
    if (!$isValid) {
        $login->saveLoginFailed($username);
        createAlert('danger', 'The security code you entered is incorrect! Try again', $loginURL);
    } elseif (empty($username) || empty($password)) {
        createAlert('danger', 'Username and password are required', $loginURL);
    } else {
        $users->setMultiCriteria([
            ['user', $username, '='],
            ['email', $username, '=', 'OR']
        ]);
        $data = $users->getOne(['password', 'user', 'status', 'email']);
        if ($data) {
            $status = intval($data['status']);
            $verified = password_verify($password, $data['password']);
            if ($verified) {
                if ($status === 2) {
                    $login->saveLoginFailed($data['user']);
                    $expires = time() + 600;
                    $resendLink = $loginURL .
                        '?token=' . $security->encryptURL($data['email'] . '|' . $expires);
                    createAlert(
                        'danger',
                        'Your account is awaiting approval! ' .
                            '<a href="' . $resendLink . '">Send a confirmation email</a>',
                        $loginURL
                    );
                } elseif ($status === 0) {
                    $login->saveLoginFailed($data['user']);
                    createAlert(
                        'danger',
                        'Your account is currently inactive! Please contact admin for more information',
                        $loginURL
                    );
                } else {
                    $expired = $remember ? '+7 days' : '+1 day';
                    $login->login($data['user'], $expired);
                    createAlert(
                        'success',
                        'You have successfully logged in',
                        $dashboardURL
                    );
                }
            } else {
                $login->saveLoginFailed($username);
                createAlert('danger', 'Incorrect username or password! Try again', $loginURL);
            }
        } else {
            $login->saveLoginFailed($username);
            createAlert('danger', 'The account is not registered', $loginURL);
        }
    }
} elseif (isset($_GET['token'])) {
    $token = array_pad(explode('|', $security->decryptURL($_GET['token'])), 2, '');
    $email = sanitizeEmail($token[0]);
    $checked = $login->loginRegisterTokenValidation($loginURL);
    if (
        !validateBoolean(Config::get('disable_confirm')) &&
        !empty(Config::get('smtp_email')) && !empty(Config::get('smtp_password'))
    ) {
        try {
            $users->setCriteria('email', $email);
            $data = $users->getOne(['name']);
            $expires = time() + 600;
            $message = HTML::renderTemplate('widget/registration-email.html.twig', [
                'recepient_name' => $data['name'],
                'email_confirmation_link' => $loginURL . '?token=' . $security->encryptURL($email . '|' . $expires),
                'sitename' => $sitename
            ]);
            $send = $mailer->send([
                'sendto' => [
                    'name' => $data['name'],
                    'email' => $email
                ],
                'subject' => 'Confirmation email (' . $sitename . ') | ' . $data['name'],
                'message' => $message
            ]);
            if ($send) {
                $saveData['updated'] = time();
                $saveData['status'] = 2;
                $users->setCriteria('email', $email);
                $insert = $users->update($saveData);
                if ($insert) {
                    createAlert(
                        'success',
                        'Please check the confirmation email that we sent to your email address. ' .
                            'If the message does not go to the inbox then check it in the spam box. ' .
                            'Follow the next steps listed there'
                    );
                } else {
                    createAlert('danger', $users->getLastError(), $loginURL);
                }
            } else {
                createAlert('danger', $users->getLastError(), $loginURL);
            }
        } catch (\Exception $e) {
            createAlert('danger', $e->getMessage(), $loginURL);
        }
    } elseif ($checked) {
        $saveData['updated'] = time();
        $saveData['status'] = 1;
        $users->setCriteria('email', $email);
        $saved = $users->update($saveData);
        if ($saved) {
            createAlert('success', 'Your account has been successfully activated! Now you can log in', $loginURL);
        } else {
            createAlert('danger', $users->getLastError(), $loginURL);
        }
    }
}

Views::renderBackendDefaultPage('users/login.html.twig', [
    'title' => 'Login',
    'message' => showAlert(),
    'loginURL' => $loginURL,
    'registerURL' => BACKEND_BASEURL . '/register/',
    'recaptcha_site_key' => Config::get('recaptcha_site_key'),
    'enable_registration' => validateBoolean(Config::get('enable_registration'))
]);
