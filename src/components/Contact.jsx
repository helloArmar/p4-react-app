import { useState } from 'react'
import Navbar from './Navbar'
import styles from './Contact.module.css'

const initialForm = { name: '', email: '', subject: '', message: '' }

const Contact = () => {
  const [form, setForm] = useState(initialForm)
  const [agreeToContact, setAgreeToContact] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => {
      if (!prev[name]) return prev
      const rest = { ...prev }
      delete rest[name]
      return rest
    })
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) {
      next.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address'
    }
    if (!form.subject.trim()) next.subject = 'Subject is required'
    if (!form.message.trim()) next.message = 'Message is required'
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      setSubmitted(true)
      setForm(initialForm)
      setAgreeToContact(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <h2 className={styles.pageTitle}>Contact Us</h2>

        {submitted && (
          <div className={styles.successBanner}>
            Message sent! We'll get back to you soon.
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Full Name <span className={styles.required}>*</span></label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Full name"
                className={errors.name ? `${styles.input} ${styles.inputError}` : styles.input}
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email Address <span className={styles.required}>*</span></label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                className={errors.email ? `${styles.input} ${styles.inputError}` : styles.input}
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="subject">Subject <span className={styles.required}>*</span></label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="e.g. Bug report, Feature request"
              className={errors.subject ? `${styles.input} ${styles.inputError}` : styles.input}
              value={form.subject}
              onChange={handleChange}
            />
            {errors.subject && <span className={styles.errorText}>{errors.subject}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="message">Message <span className={styles.required}>*</span></label>
            <textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Your message here..."
              className={errors.message ? `${styles.textarea} ${styles.inputError}` : styles.textarea}
              value={form.message}
              onChange={handleChange}
            />
            {errors.message && <span className={styles.errorText}>{errors.message}</span>}
          </div>

          <label className={styles.checkboxRow} htmlFor="agree">
            <input
              id="agree"
              type="checkbox"
              checked={agreeToContact}
              onChange={(e) => setAgreeToContact(e.target.checked)}
            />
            I agree to be contacted regarding my inquiry
          </label>

          <button type="submit" className={styles.submitBtn}>✉ Send Message</button>
        </form>
      </main>
    </div>
  )
}

export default Contact
