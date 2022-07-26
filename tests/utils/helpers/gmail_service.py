import email
import imaplib
import time

# imap need to be enabled on gmail account and access for less secure devices need to be anabled for that google account
from utils.enums.shared_dict_keys import SharedDictKey
from utils.helpers.request_executor import shared_dict

SMTP_SERVER = 'imap.gmail.com'
SMTP_PORT = 993


def gmail_login():
    # pylint: disable=invalid-name
    try:
        mail = imaplib.IMAP4_SSL(SMTP_SERVER)
        mail.login(shared_dict[SharedDictKey.VCTP_EMAIL_LOGIN.value], shared_dict[SharedDictKey.VCTP_PASSWORD.value])
        mail.select('inbox')
        return mail
    except Exception as e:
        print('User cannot login to gmail: ' + str(e))
        return None


def get_unseen_email_ids():
    mail = gmail_login()
    _, data = mail.search(None, 'UNSEEN')
    mail_ids = data[0]
    if mail_ids:
        id_list = mail_ids.split()
        return id_list
    else:
        gmail_logout(mail)
        raise Exception('Lack of Unseen emails')


def get_last_five_email_ids():
    mail = gmail_login()
    _, data = mail.search(None, 'ALL')
    mail_ids = data[0]
    if mail_ids:
        id_list = mail_ids.split()
        return id_list[5]
    else:
        gmail_logout(mail)
        raise Exception('Gmail inbox is empty')


def get_verification_code_from_email_subject(mail_id):
    mail = gmail_login()
    time.sleep(1)
    data = mail.fetch(str(mail_id), '(RFC822)')
    email_txt = str(data[1][0][1], 'utf-8')
    msg = email.message_from_string(email_txt)
    email_subject = msg['subject']
    code = email_subject.split()[4]
    gmail_logout(mail)
    return code


def get_unseen_mail_ids_with_wait(max_seconds):
    # pylint: disable=invalid-name
    time.sleep(2)
    while max_seconds:
        try:
            return get_unseen_email_ids()
        except Exception as e:
            print(str(e) + ' - trying again')
            time.sleep(1)
            max_seconds -= 1
    raise Exception('Lack of Unseen emails - searching over')


def get_last_five_mail_ids_with_wait(max_seconds):
    # pylint: disable=invalid-name
    while max_seconds:
        try:
            return get_last_five_email_ids()
        except Exception as e:
            print(str(e) + ' - trying again')
            time.sleep(1)
            max_seconds -= 1
    raise Exception('Lack of emails - searching over')


def gmail_logout(mail):
    mail.close()
    mail.logout()
