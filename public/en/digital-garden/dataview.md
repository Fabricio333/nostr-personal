```dataview
table title as Title, last_revision as Last_Edit, date as Pub_Dat, published, tags

sort last_revision desc

```
where published = true
where published != true