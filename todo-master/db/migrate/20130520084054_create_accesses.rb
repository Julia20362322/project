class CreateAccesses < ActiveRecord::Migration
  def change
    create_table :accesses do |t|
      t.references, :user
      t.references, :list
      t.boolean :owner

      t.timestamps
    end
  end
end
