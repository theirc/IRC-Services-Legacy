# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class LoginTestCase(unittest.TestCase):
    def setUp(self):
        options = webdriver.ChromeOptions()
        options.add_argument('headless')
        options.add_argument('window-size=1200x600')

        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(30)
        self.verificationErrors = []
        self.accept_next_alert = True
    
    def test_failure(self):
        self.assertTrue(False)

    def test_login(self):
        driver = self.driver
        driver.get("http://localhost:9999/login/?next=/")
        driver.find_element_by_id("id_username").click()
        driver.find_element_by_id("id_username").clear()
        driver.find_element_by_id("id_username").send_keys("reynaldo.rodrigues@rescue.org")
        driver.find_element_by_id("id_password").clear()
        driver.find_element_by_id("id_password").send_keys("P@ssw0rd")
        driver.find_element_by_id("login_submit").click()
        for i in range(60):
            try:
                if self.is_element_present(By.XPATH, "//input[@placeholder='Search']"): break
            except: pass
            time.sleep(1)
        else: self.fail("time out")
        for i in range(60):
            try:
                if not driver.find_element_by_css_selector(".fixed-loading-container").is_displayed(): break
            except: pass
            time.sleep(1)
        else: self.fail("time out")
        driver.find_element_by_link_text("Service Search").click()
        driver.find_element_by_xpath("//div[3]/div/select").click()
        Select(driver.find_element_by_xpath("//div[3]/div/select")).select_by_visible_text("El Salvador")
        driver.find_element_by_xpath("//div[3]/div[2]/select").click()
        Select(driver.find_element_by_xpath("//div[3]/div[2]/select")).select_by_visible_text("San Salvador")
        driver.find_element_by_xpath("//button[2]").click()
        for i in range(60):
            try:
                if not driver.find_element_by_css_selector(".fixed-loading-container").is_displayed(): break
            except: pass
            time.sleep(1)
        else: self.fail("time out")

        driver.get_screenshot_as_file('out.png')
    
    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException as e: return False
        return True
    
    def is_alert_present(self):
        try: self.driver.switch_to_alert()
        except NoAlertPresentException as e: return False
        return True
    
    def close_alert_and_get_its_text(self):
        try:
            alert = self.driver.switch_to_alert()
            alert_text = alert.text
            if self.accept_next_alert:
                alert.accept()
            else:
                alert.dismiss()
            return alert_text
        finally: self.accept_next_alert = True
    
    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
