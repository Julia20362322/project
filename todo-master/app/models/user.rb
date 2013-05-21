class User < ActiveRecord::Base
  has_many :accesses
  has_many :lists, through :accesses
  attr_accessible :email, :password_digest
  
  attr_accessor : password
  
  before_save { |user| user.email = email.downcase }
  
  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  # at least one letter, or dot, at least one @ followed by at least one letter and .
  validates :email, presence: true, format: { with: VALID_EMAIL_REGEX } uniqueness: true
  
  validates :password, :length => { :within => 6..40 } 
  validates :password_confirmation, :presence => true 
  has_secure_password
  
  before_save :encrypt_password 
  
  private 
	 def encrypt_password 
		 self.salt = make_salt if new_record? 
		 self.encrypted_password = encrypt(password) 
	 end 
	 
	 def encrypt(string) 
		secure_hash("#{salt} -- #{string}") 
	 end 
	 
	 def make_salt 
		secure_hash("#{Time.now.utc} -- #{password}") 
	 end 
	
	 def secure_hash(string) 
		Digest::SHA2.hexdigest(string) 
	 end
	 
	 def authenticate?(submitted_password) 
		encrypted_password == encrypt(submitted_password) 
	 end 
end 
