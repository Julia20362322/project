class List < ActiveRecord::Base
  has_many :accesses
  has_many :users, through :accesses
  attr_accessible :name
end
