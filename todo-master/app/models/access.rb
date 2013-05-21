class Access < ActiveRecord::Base
  belongs_to :list
  belongs_to :user
  attr_accessible :list, :owner, :user
end
